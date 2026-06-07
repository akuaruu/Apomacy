package repository

import (
	"context"
	"fmt"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type obatRepository struct {
	db *pgxpool.Pool
}

// Constructor untuk inisialiasai repo
func NewObatRepository(db *pgxpool.Pool) model.ObatRepository {
	return &obatRepository{db: db}
}

func (r *obatRepository) Create(ctx context.Context, obat *model.Obat) error {
	query := `
		INSERT INTO obat (
			id_supplier, kode_obat, nama_obat, jenis_obat, bentuk_obat, satuan, 
			harga_beli, harga_jual, stok, stok_minimum, expired_date, 
			gambar_produk, dosis_pemakaian, komposisi, deskripsi
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		) RETURNING id_obat, created_at, updated_at
	`

	// QueryRow digunakan karena kita ingin menangkap nilai RETURNING
	err := r.db.QueryRow(ctx, query,
		obat.IDSupplier, obat.KodeObat, obat.NamaObat, obat.JenisObat, obat.BentukObat, obat.Satuan,
		obat.HargaBeli, obat.HargaJual, obat.Stok, obat.StokMinimum, obat.ExpiredDate,
		obat.GambarProduk, obat.DosisPemakaian, obat.Komposisi, obat.Deskripsi,
	).Scan(&obat.ID, &obat.CreatedAt, &obat.UpdatedAt)

	if err != nil {
		return fmt.Errorf("gagal insert obat: %v", err)
	}

	return nil
}

func (r *obatRepository) GetByID(ctx context.Context, id int) (*model.Obat, error) {
	query := `SELECT * FROM obat WHERE id_obat = $1`

	var o model.Obat
	err := r.db.QueryRow(ctx, query, id).Scan(
		&o.ID, &o.IDSupplier, &o.KodeObat, &o.NamaObat, &o.JenisObat, &o.BentukObat, &o.Satuan,
		&o.HargaBeli, &o.HargaJual, &o.Stok, &o.StokMinimum, &o.ExpiredDate,
		&o.GambarProduk, &o.DosisPemakaian, &o.Komposisi, &o.Deskripsi,
		&o.CreatedAt, &o.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("obat tidak ditemukan: %v", err)
	}

	return &o, nil
}

func (r *obatRepository) GetAll(ctx context.Context) ([]model.Obat, error) {
	query := `SELECT * FROM obat ORDER BY nama_obat ASC`

	// Query digunakan untuk mengambil banyak baris (slice)
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query all obat: %v", err)
	}
	defer rows.Close() // Wajib agar koneksi tidak bocor (memory leak)

	var listObat []model.Obat
	for rows.Next() {
		var o model.Obat
		err := rows.Scan(
			&o.ID, &o.IDSupplier, &o.KodeObat, &o.NamaObat, &o.JenisObat, &o.BentukObat, &o.Satuan,
			&o.HargaBeli, &o.HargaJual, &o.Stok, &o.StokMinimum, &o.ExpiredDate,
			&o.GambarProduk, &o.DosisPemakaian, &o.Komposisi, &o.Deskripsi,
			&o.CreatedAt, &o.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan baris obat: %v", err)
		}
		listObat = append(listObat, o)
	}

	return listObat, nil
}

func (r *obatRepository) Update(ctx context.Context, obat *model.Obat) error {
	// Query dibuat komprehensif untuk mengupdate seluruh field yang ada di struct
	query := `
		UPDATE obat SET 
			id_supplier = $1, 
			kode_obat = $2, 
			nama_obat = $3, 
			jenis_obat = $4, 
			bentuk_obat = $5, 
			satuan = $6, 
			harga_beli = $7, 
			harga_jual = $8, 
			stok = $9, 
			stok_minimum = $10, 
			expired_date = $11, 
			gambar_produk = $12, 
			dosis_pemakaian = $13, 
			komposisi = $14, 
			deskripsi = $15,
			updated_at = NOW()
		WHERE id_obat = $16 
		RETURNING updated_at
	`

	err := r.db.QueryRow(ctx, query,
		obat.IDSupplier,
		obat.KodeObat,
		obat.NamaObat,
		obat.JenisObat,
		obat.BentukObat,
		obat.Satuan,
		obat.HargaBeli,
		obat.HargaJual,
		obat.Stok,
		obat.StokMinimum,
		obat.ExpiredDate,
		obat.GambarProduk,
		obat.DosisPemakaian,
		obat.Komposisi,
		obat.Deskripsi,
		obat.ID, // $16 adalah parameter kondisi WHERE
	).Scan(&obat.UpdatedAt)

	return err
}

func (r *obatRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM obat WHERE id_obat = $1`

	_, err := r.db.Exec(ctx, query, id)
	return err
}
