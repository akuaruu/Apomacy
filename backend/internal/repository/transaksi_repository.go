package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/jackc/pgx/v5"
)

type transaksiRepository struct {
	db DBTx
}

func NewTransaksiRepository(db DBTx) model.TransaksiRepository {
	return &transaksiRepository{db: db}
}

func (r *transaksiRepository) CreateWithDetails(ctx context.Context, tx *model.Transaksi) error {
	dbTx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer dbTx.Rollback(ctx)

	tx.TanggalTransaksi = time.Now()
	if tx.Status == "" {
		tx.Status = model.TxPending
	}
	if tx.StatusPesanan == "" {
		tx.StatusPesanan = "Menunggu Pembayaran"
	}

	queryTrx := `
		INSERT INTO transaksi (
			id_customer, id_user, no_transaksi, tanggal_transaksi, nama_customer, 
			total_item, subtotal, total_bayar, metode_pembayaran, resep_required, no_resep, status, status_pesanan
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		) RETURNING id_transaksi`

	err = dbTx.QueryRow(ctx, queryTrx,
		tx.IDCustomer, tx.IDUser, tx.NoTransaksi, tx.TanggalTransaksi, tx.NamaCustomer,
		tx.TotalItem, tx.Subtotal, tx.TotalBayar, tx.MetodePembayaran,
		tx.ResepRequired, tx.NoResep, tx.Status, tx.StatusPesanan,
	).Scan(&tx.ID)

	if err != nil {
		fmt.Printf("[REPO ERROR] Insert transaksi gagal: %+v\nPayload: %+v\n", err, tx)
		return err
	}

	queryDetail := `
		INSERT INTO detail_transaksi (
			id_transaksi, id_obat, nama_obat, harga_satuan, qty, subtotal
		) VALUES ($1, $2, $3, $4, $5, $6)`

	queryUpdateStok := `UPDATE obat SET stok = stok - $1 WHERE id_obat = $2 AND stok >= $1`

	for _, detail := range tx.Details {
		_, err = dbTx.Exec(ctx, queryDetail,
			tx.ID, detail.IDObat, detail.NamaObat, detail.HargaSatuan, detail.Qty, detail.Subtotal,
		)
		if err != nil {
			return err
		}

		res, err := dbTx.Exec(ctx, queryUpdateStok, detail.Qty, detail.IDObat)
		if err != nil {
			return err
		}
		if res.RowsAffected() == 0 {
			return errors.New("stok obat tidak mencukupi untuk item: " + detail.NamaObat)
		}
	}

	if tx.Pengiriman != nil {
		queryPengiriman := `
			INSERT INTO transaksi_pengiriman (
				id_transaksi, metode_penerimaan, nama_penerima, no_hp_penerima, alamat_pengiriman
			) VALUES ($1, $2, $3, $4, $5) RETURNING id_pengiriman`

		err = dbTx.QueryRow(ctx, queryPengiriman,
			tx.ID,
			tx.Pengiriman.MetodePenerimaan,
			tx.Pengiriman.NamaPenerima,
			tx.Pengiriman.NoHpPenerima,
			tx.Pengiriman.AlamatPengiriman,
		).Scan(&tx.Pengiriman.IDPengiriman)

		if err != nil {
			fmt.Printf("[REPO ERROR] Insert pengiriman gagal: %+v\n", err)
			return err
		}
	}

	return dbTx.Commit(ctx)
}

// GetByID mengambil transaksi beserta detail item dan data pengiriman (jika ada) dalam query gabungan
func (r *transaksiRepository) GetByID(ctx context.Context, id int) (*model.Transaksi, error) {
	var t model.Transaksi
	var pIDPengiriman *int
	var pMetode *string
	var pNama, pHp, pAlamat *string
	var pWaktu *time.Time

	query := `
		SELECT 
			t.id_transaksi, t.id_customer, t.id_user, t.no_transaksi, t.tanggal_transaksi, t.nama_customer, 
			t.total_item, t.subtotal, t.total_bayar, t.metode_pembayaran, t.resep_required, t.no_resep, 
			t.status, t.status_pesanan,
			p.id_pengiriman, p.metode_penerimaan, p.nama_penerima, p.no_hp_penerima, 
			p.alamat_pengiriman, p.waktu_pesanan_sampai
		FROM transaksi t
		LEFT JOIN transaksi_pengiriman p ON p.id_transaksi = t.id_transaksi
		WHERE t.id_transaksi = $1`

	err := r.db.QueryRow(ctx, query, id).Scan(
		&t.ID, &t.IDCustomer, &t.IDUser, &t.NoTransaksi, &t.TanggalTransaksi, &t.NamaCustomer,
		&t.TotalItem, &t.Subtotal, &t.TotalBayar, &t.MetodePembayaran, &t.ResepRequired,
		&t.NoResep, &t.Status, &t.StatusPesanan,
		&pIDPengiriman, &pMetode, &pNama, &pHp, &pAlamat, &pWaktu,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("transaksi tidak ditemukan")
		}
		return nil, err
	}

	if pIDPengiriman != nil {
		t.Pengiriman = &model.Pengiriman{
			IDPengiriman:     *pIDPengiriman,
			IDTransaksi:      t.ID,
			NamaPenerima:     pNama,
			NoHpPenerima:     pHp,
			AlamatPengiriman: pAlamat,
			WaktuSampai:      pWaktu,
		}
		if pMetode != nil {
			t.Pengiriman.MetodePenerimaan = *pMetode
		}
	}

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
	var query string

	if status == model.TxSelesai {
		query = `UPDATE transaksi SET status = $1, status_pesanan = 'Menunggu Diproses' WHERE no_transaksi = $2`
	} else if status == model.TxBatal {
		query = `UPDATE transaksi SET status = $1, status_pesanan = 'Dibatalkan' WHERE no_transaksi = $2`
	} else {
		query = `UPDATE transaksi SET status = $1 WHERE no_transaksi = $2`
	}

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
		       resep_required, no_resep, status, status_pesanan
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
			&t.ResepRequired, &t.NoResep, &t.Status, &t.StatusPesanan,
		); err != nil {
			return nil, err
		}
		result = append(result, &t)
	}

	return result, nil
}

// GetAll mengambil seluruh transaksi beserta detail dan pengiriman menggunakan batch query
// untuk menghindari N+1 query saat data transaksi berjumlah besar
func (r *transaksiRepository) GetAll(ctx context.Context) ([]model.Transaksi, error) {
	queryTrx := `
		SELECT id_transaksi, id_customer, id_user, no_transaksi, tanggal_transaksi, 
		       nama_customer, total_item, subtotal, total_bayar, metode_pembayaran, 
		       resep_required, no_resep, status, status_pesanan
		FROM transaksi
		ORDER BY tanggal_transaksi DESC
	`
	rows, err := r.db.Query(ctx, queryTrx)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []model.Transaksi
	idIndex := make(map[int]int)

	for rows.Next() {
		var t model.Transaksi
		err := rows.Scan(
			&t.ID, &t.IDCustomer, &t.IDUser, &t.NoTransaksi, &t.TanggalTransaksi,
			&t.NamaCustomer, &t.TotalItem, &t.Subtotal, &t.TotalBayar, &t.MetodePembayaran,
			&t.ResepRequired, &t.NoResep, &t.Status, &t.StatusPesanan,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
		idIndex[t.ID] = len(transactions) - 1
	}
	rows.Close()

	if len(transactions) == 0 {
		return transactions, nil
	}

	ids := make([]int, 0, len(transactions))
	for _, t := range transactions {
		ids = append(ids, t.ID)
	}

	// Batch fetch semua detail dalam satu query
	queryDetails := `
		SELECT id_detail_trx, id_transaksi, id_obat, nama_obat, harga_satuan, qty, subtotal 
		FROM detail_transaksi WHERE id_transaksi = ANY($1)
	`
	detailRows, err := r.db.Query(ctx, queryDetails, ids)
	if err != nil {
		return nil, err
	}
	for detailRows.Next() {
		var dt model.DetailTransaksi
		if err := detailRows.Scan(&dt.IDDetailTrx, &dt.IDTransaksi, &dt.IDObat, &dt.NamaObat, &dt.HargaSatuan, &dt.Qty, &dt.Subtotal); err != nil {
			detailRows.Close()
			return nil, err
		}
		if idx, ok := idIndex[dt.IDTransaksi]; ok {
			transactions[idx].Details = append(transactions[idx].Details, dt)
		}
	}
	detailRows.Close()

	// Batch fetch semua pengiriman dalam satu query
	queryPengiriman := `
		SELECT id_pengiriman, id_transaksi, metode_penerimaan, nama_penerima, 
		       no_hp_penerima, alamat_pengiriman, waktu_pesanan_sampai
		FROM transaksi_pengiriman WHERE id_transaksi = ANY($1)
	`
	pengirimanRows, err := r.db.Query(ctx, queryPengiriman, ids)
	if err != nil {
		return nil, err
	}
	for pengirimanRows.Next() {
		var p model.Pengiriman
		if err := pengirimanRows.Scan(
			&p.IDPengiriman, &p.IDTransaksi, &p.MetodePenerimaan, &p.NamaPenerima,
			&p.NoHpPenerima, &p.AlamatPengiriman, &p.WaktuSampai,
		); err != nil {
			pengirimanRows.Close()
			return nil, err
		}
		if idx, ok := idIndex[p.IDTransaksi]; ok {
			pCopy := p
			transactions[idx].Pengiriman = &pCopy
		}
	}
	pengirimanRows.Close()

	return transactions, nil
}

func (r *transaksiRepository) UpdateStatusPesanan(ctx context.Context, noTransaksi string, statusPesanan string) error {
	query := `UPDATE transaksi SET status_pesanan = $1 WHERE no_transaksi = $2`
	_, err := r.db.Exec(ctx, query, statusPesanan, noTransaksi)
	return err
}
