package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type transaksiRepository struct {
	db *pgxpool.Pool
}

func NewTransaksiRepository(db *pgxpool.Pool) model.TransaksiRepository {
	return &transaksiRepository{db: db}
}

func (r *transaksiRepository) CreateWithDetails(ctx context.Context, tx *model.Transaksi) error {
	// Mulai Database Transaction
	dbTx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	// Pastikan rollback terpanggil jika fungsi return sebelum di-commit
	defer dbTx.Rollback(ctx)

	tx.TanggalTransaksi = time.Now()
	if tx.Status == "" {
		tx.Status = model.TxPending // Default status
	}

	// 1. Insert ke tabel utama (transaksi)
	queryTrx := `
		INSERT INTO transaksi (
			id_customer, id_user, no_transaksi, tanggal_transaksi, nama_customer, 
			total_item, subtotal, total_bayar, metode_pembayaran, resep_required, no_resep, status
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		) RETURNING id_transaksi`

	err = dbTx.QueryRow(ctx, queryTrx,
		tx.IDCustomer, tx.IDUser, tx.NoTransaksi, tx.TanggalTransaksi, tx.NamaCustomer,
		tx.TotalItem, tx.Subtotal, tx.TotalBayar, tx.MetodePembayaran,
		tx.ResepRequired, tx.NoResep, tx.Status,
	).Scan(&tx.ID)

	if err != nil {
		// Tambah log detail
		fmt.Printf("[REPO ERROR] Insert transaksi gagal: %+v\nPayload: %+v\n", err, tx)
		return err
	}

	// 2. Insert ke tabel detail_transaksi DAN update stok obat
	queryDetail := `
		INSERT INTO detail_transaksi (
			id_transaksi, id_obat, nama_obat, harga_satuan, qty, subtotal
		) VALUES ($1, $2, $3, $4, $5, $6)`

	queryUpdateStok := `UPDATE obat SET stok = stok - $1 WHERE id_obat = $2 AND stok >= $1`

	for _, detail := range tx.Details {
		// Insert detail transaksi
		_, err = dbTx.Exec(ctx, queryDetail,
			tx.ID, detail.IDObat, detail.NamaObat, detail.HargaSatuan, detail.Qty, detail.Subtotal,
		)
		if err != nil {
			return err
		}

		// Update (kurangi) stok obat
		res, err := dbTx.Exec(ctx, queryUpdateStok, detail.Qty, detail.IDObat)
		if err != nil {
			return err
		}
		if res.RowsAffected() == 0 {
			return errors.New("stok obat tidak mencukupi untuk item: " + detail.NamaObat)
		}
	}

	// Jika semua lancar, commit transaksi
	return dbTx.Commit(ctx)
}

func (r *transaksiRepository) GetByID(ctx context.Context, id int) (*model.Transaksi, error) {
	var t model.Transaksi
	query := `SELECT id_transaksi, id_customer, id_user, no_transaksi, tanggal_transaksi, nama_customer, 
	          total_item, subtotal, total_bayar, metode_pembayaran, resep_required, no_resep, status 
	          FROM transaksi WHERE id_transaksi = $1`

	err := r.db.QueryRow(ctx, query, id).Scan(
		&t.ID, &t.IDCustomer, &t.IDUser, &t.NoTransaksi, &t.TanggalTransaksi, &t.NamaCustomer,
		&t.TotalItem, &t.Subtotal, &t.TotalBayar, &t.MetodePembayaran, &t.ResepRequired,
		&t.NoResep, &t.Status,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("transaksi tidak ditemukan")
		}
		return nil, err
	}

	// Ambil detail transaksinya juga
	queryDetails := `SELECT id_detail_trx, id_transaksi, id_obat, nama_obat, harga_satuan, qty, subtotal 
	                 FROM detail_transaksi WHERE id_transaksi = $1`

	rows, err := r.db.Query(ctx, queryDetails, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var dt model.DetailTransaksi
		if err := rows.Scan(&dt.IDDetailTrx, &dt.IDTransaksi, &dt.IDObat, &dt.NamaObat, &dt.HargaSatuan, &dt.Qty, &dt.Subtotal); err != nil {
			return nil, err
		}
		t.Details = append(t.Details, dt)
	}

	return &t, nil
}

func (r *transaksiRepository) UpdateStatus(ctx context.Context, id int, status model.StatusTransaksi) error {
	query := `UPDATE transaksi SET status = $1 WHERE id_transaksi = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *transaksiRepository) UpdateStatusByNoTransaksi(ctx context.Context, noTransaksi string, status model.StatusTransaksi) error {
	query := `UPDATE transaksi SET status = $1 WHERE no_transaksi = $2`
	result, err := r.db.Exec(ctx, query, status, noTransaksi)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("transaksi tidak ditemukan: " + noTransaksi)
	}
	return nil
}

func (r *transaksiRepository) GetByUserID(ctx context.Context, idUser int) ([]*model.Transaksi, error) {
	query := `
		SELECT id_transaksi, id_customer, id_user, no_transaksi, tanggal_transaksi,
		       nama_customer, total_item, subtotal, total_bayar, metode_pembayaran,
		       resep_required, no_resep, status
		FROM transaksi
		WHERE id_user = $1
		ORDER BY tanggal_transaksi DESC`

	rows, err := r.db.Query(ctx, query, idUser)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []*model.Transaksi
	for rows.Next() {
		var t model.Transaksi
		if err := rows.Scan(
			&t.ID, &t.IDCustomer, &t.IDUser, &t.NoTransaksi, &t.TanggalTransaksi,
			&t.NamaCustomer, &t.TotalItem, &t.Subtotal, &t.TotalBayar, &t.MetodePembayaran,
			&t.ResepRequired, &t.NoResep, &t.Status,
		); err != nil {
			return nil, err
		}
		result = append(result, &t)
	}

	return result, nil
}
