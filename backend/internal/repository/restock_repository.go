package repository

import (
	"context"
	"fmt"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type restockRepository struct {
	db *pgxpool.Pool
}

func NewRestockRepository(db *pgxpool.Pool) model.RestockRepository {
	return &restockRepository{db: db}
}

// Implementasi fungsi dari interface model.RestockRepository
func (r *restockRepository) CreateWithDetails(ctx context.Context, header *model.Restock) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("gagal memulai transaksi: %v", err)
	}
	defer tx.Rollback(ctx)

	// 1. Insert ke tabel 'restock' (BUKAN restock_header)
	// Menghapus 'created_at' karena tidak ada di skema tabel public.restock
	queryHeader := `
		INSERT INTO restock (id_supplier, id_user, no_faktur_supplier, no_penerimaan_internal, tanggal_restock, total_bayar, keterangan)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_restock`

	err = tx.QueryRow(ctx, queryHeader,
		header.IDSupplier, header.IDUser, header.NoFakturSupplier,
		header.NoPenerimaanInternal, header.TanggalRestock,
		header.TotalBayar, header.Keterangan,
	).Scan(&header.ID)

	if err != nil {
		return fmt.Errorf("gagal insert header: %v", err)
	}

	// 2. Looping insert ke tabel 'detail_restock' (BUKAN restock_detail) & Update tabel obat
	queryDetail := `
		INSERT INTO detail_restock (id_restock, id_obat, harga_beli, jumlah, tanggal_kadaluarsa, subtotal)
		VALUES ($1, $2, $3, $4, $5, $6)`

	queryUpdateObat := `
		UPDATE obat 
		SET stok = stok + $1, harga_beli = $2, expired_date = $3, updated_at = NOW() 
		WHERE id_obat = $4`

	for _, detail := range header.Details {
		_, err = tx.Exec(ctx, queryDetail,
			header.ID, detail.IDObat, detail.HargaBeli, detail.Jumlah, detail.TanggalKadaluarsa, detail.Subtotal,
		)
		if err != nil {
			return fmt.Errorf("gagal insert detail obat ID %d: %v", detail.IDObat, err)
		}

		_, err = tx.Exec(ctx, queryUpdateObat,
			detail.Jumlah, detail.HargaBeli, detail.TanggalKadaluarsa, detail.IDObat,
		)
		if err != nil {
			return fmt.Errorf("gagal update stok obat ID %d: %v", detail.IDObat, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("gagal commit transaksi: %v", err)
	}

	return nil
}

// Implementasi fungsi get by id agar interface model.RestockRepository terpenuhi
func (r *restockRepository) GetByID(ctx context.Context, id int) (*model.Restock, error) {
	// (Kosongkan dulu tidak apa-apa karena saat ini frontend baru butuh proses Create)
	return nil, fmt.Errorf("belum diimplementasikan")
}
