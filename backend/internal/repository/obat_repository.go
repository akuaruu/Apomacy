package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type obatRepository struct {
	db *pgxpool.Pool
}

// Constructor untuk inisialisasi repo
func NewObatRepository(db *pgxpool.Pool) model.ObatRepository {
	return &obatRepository{db: db}
}

// FUNGSI HELPER: Sinkronisasi Kategori (Many-to-Many)
func (r *obatRepository) syncKategori(ctx context.Context, idObat int, kategoriList []string) error {
	// 1. Bersihkan relasi lama (Penting saat proses Edit)
	_, err := r.db.Exec(ctx, `DELETE FROM obat_kategori WHERE id_obat = $1`, idObat)
	if err != nil {
		return fmt.Errorf("gagal menghapus relasi kategori lama: %v", err)
	}

	// 2. Jika tidak ada kategori yang dipilih, hentikan proses dengan sukses
	if len(kategoriList) == 0 {
		return nil
	}

	// 3. Looping setiap kategori dari frontend
	for _, namaKategori := range kategoriList {
		var idKategori int

		// Cek apakah kategori sudah ada di tabel master 'kategori'
		err := r.db.QueryRow(ctx, `SELECT id_kategori FROM kategori WHERE nama_kategori = $1`, namaKategori).Scan(&idKategori)

		// Penanganan khusus untuk pgx jika data tidak ditemukan
		if errors.Is(err, pgx.ErrNoRows) {
			// Insert sebagai kategori baru
			err = r.db.QueryRow(ctx, `INSERT INTO kategori (nama_kategori) VALUES ($1) RETURNING id_kategori`, namaKategori).Scan(&idKategori)
			if err != nil {
				return fmt.Errorf("gagal insert kategori baru: %v", err)
			}
		} else if err != nil {
			return fmt.Errorf("gagal mencari kategori: %v", err)
		}

		// 4. Jahit relasinya ke tabel bridge 'obat_kategori'
		_, err = r.db.Exec(ctx, `INSERT INTO obat_kategori (id_obat, id_kategori) VALUES ($1, $2)`, idObat, idKategori)
		if err != nil {
			return fmt.Errorf("gagal insert relasi obat_kategori: %v", err)
		}
	}

	return nil
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

	err := r.db.QueryRow(ctx, query,
		obat.IDSupplier, obat.KodeObat, obat.NamaObat, obat.JenisObat, obat.BentukObat, obat.Satuan,
		obat.HargaBeli, obat.HargaJual, obat.Stok, obat.StokMinimum, obat.ExpiredDate,
		obat.GambarProduk, obat.DosisPemakaian, obat.Komposisi, obat.Deskripsi,
	).Scan(&obat.ID, &obat.CreatedAt, &obat.UpdatedAt)

	if err != nil {
		return fmt.Errorf("gagal insert obat: %v", err)
	}

	// Sinkronisasi kategori setelah mendapatkan ID Obat baru
	if len(obat.Kategori) > 0 {
		if err := r.syncKategori(ctx, obat.ID, obat.Kategori); err != nil {
			return err
		}
	}

	return nil
}

func (r *obatRepository) GetByID(ctx context.Context, id int) (*model.Obat, error) {
	// Query JOIN untuk menarik array kategori sekaligus
	query := `
		SELECT 
			o.id_obat, o.id_supplier, o.kode_obat, o.nama_obat, o.jenis_obat, o.bentuk_obat, o.satuan,
			o.harga_beli, o.harga_jual, o.stok, o.stok_minimum, o.expired_date,
			o.gambar_produk, o.dosis_pemakaian, o.komposisi, o.deskripsi,
			o.created_at, o.updated_at,
			COALESCE(string_agg(k.nama_kategori, ','), '') AS kategori_gabungan
		FROM obat o
		LEFT JOIN obat_kategori ok ON o.id_obat = ok.id_obat
		LEFT JOIN kategori k ON ok.id_kategori = k.id_kategori
		WHERE o.id_obat = $1
		GROUP BY o.id_obat
	`

	var o model.Obat
	var kategoriGabungan string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&o.ID, &o.IDSupplier, &o.KodeObat, &o.NamaObat, &o.JenisObat, &o.BentukObat, &o.Satuan,
		&o.HargaBeli, &o.HargaJual, &o.Stok, &o.StokMinimum, &o.ExpiredDate,
		&o.GambarProduk, &o.DosisPemakaian, &o.Komposisi, &o.Deskripsi,
		&o.CreatedAt, &o.UpdatedAt,
		&kategoriGabungan,
	)

	if err != nil {
		return nil, fmt.Errorf("obat tidak ditemukan: %v", err)
	}

	if kategoriGabungan != "" {
		o.Kategori = strings.Split(kategoriGabungan, ",")
	} else {
		o.Kategori = []string{}
	}

	return &o, nil
}

func (r *obatRepository) GetAll(ctx context.Context) ([]model.Obat, error) {
	// Query JOIN untuk menarik semua data beserta tag kategorinya
	query := `
		SELECT 
			o.id_obat, o.id_supplier, o.kode_obat, o.nama_obat, o.jenis_obat, o.bentuk_obat, o.satuan,
			o.harga_beli, o.harga_jual, o.stok, o.stok_minimum, o.expired_date,
			o.gambar_produk, o.dosis_pemakaian, o.komposisi, o.deskripsi,
			o.created_at, o.updated_at,
			COALESCE(string_agg(k.nama_kategori, ','), '') AS kategori_gabungan
		FROM obat o
		LEFT JOIN obat_kategori ok ON o.id_obat = ok.id_obat
		LEFT JOIN kategori k ON ok.id_kategori = k.id_kategori
		GROUP BY o.id_obat
		ORDER BY o.nama_obat ASC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query all obat: %v", err)
	}
	defer rows.Close()

	var listObat []model.Obat
	for rows.Next() {
		var o model.Obat
		var kategoriGabungan string

		err := rows.Scan(
			&o.ID, &o.IDSupplier, &o.KodeObat, &o.NamaObat, &o.JenisObat, &o.BentukObat, &o.Satuan,
			&o.HargaBeli, &o.HargaJual, &o.Stok, &o.StokMinimum, &o.ExpiredDate,
			&o.GambarProduk, &o.DosisPemakaian, &o.Komposisi, &o.Deskripsi,
			&o.CreatedAt, &o.UpdatedAt,
			&kategoriGabungan, // Tangkap hasil string_agg
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan baris obat: %v", err)
		}

		// Memecah teks "Demam,Vitamin" menjadi Array
		if kategoriGabungan != "" {
			o.Kategori = strings.Split(kategoriGabungan, ",")
		} else {
			o.Kategori = []string{}
		}

		listObat = append(listObat, o)
	}

	return listObat, nil
}

func (r *obatRepository) Update(ctx context.Context, obat *model.Obat) error {
	query := `
		UPDATE obat SET 
			nama_obat = $1, 
			jenis_obat = $2, 
			bentuk_obat = $3, 
			satuan = $4, 
			id_supplier = $5,
			harga_beli = $6, 
			harga_jual = $7, 
			stok = $8, 
			stok_minimum = $9, 
			expired_date = $10,
			dosis_pemakaian = $11, 
			komposisi = $12, 
			deskripsi = $13, 
			gambar_produk = $14
		WHERE id_obat = $15 RETURNING updated_at`

	err := r.db.QueryRow(ctx, query,
		obat.NamaObat,
		obat.JenisObat,
		obat.BentukObat,
		obat.Satuan,
		obat.IDSupplier,
		obat.HargaBeli,
		obat.HargaJual,
		obat.Stok,
		obat.StokMinimum,
		obat.ExpiredDate,
		obat.DosisPemakaian,
		obat.Komposisi,
		obat.Deskripsi,
		obat.GambarProduk,
		obat.ID,
	).Scan(&obat.UpdatedAt)

	if err != nil {
		return fmt.Errorf("gagal update obat: %v", err)
	}

	// Menjalankan sinkronisasi relasi kategori saat update
	if err := r.syncKategori(ctx, obat.ID, obat.Kategori); err != nil {
		return err
	}

	return nil
}

func (r *obatRepository) Delete(ctx context.Context, id int) error {
	// Praktik terbaik: Hapus relasi di bridge table terlebih dahulu sebelum menghapus obat utama
	// (Kecuali tabel sudah memakai ON DELETE CASCADE di database)
	_, err := r.db.Exec(ctx, `DELETE FROM obat_kategori WHERE id_obat = $1`, id)
	if err != nil {
		return fmt.Errorf("gagal menghapus relasi kategori: %v", err)
	}

	query := `DELETE FROM obat WHERE id_obat = $1`
	_, err = r.db.Exec(ctx, query, id)
	return err
}
