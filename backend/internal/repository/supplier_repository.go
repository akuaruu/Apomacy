package repository

import (
	"context"
	"errors"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/jackc/pgx/v5"
)

type supplierRepository struct {
	db DBTx
}

func NewSupplierRepository(db DBTx) model.SupplierRepository {
	return &supplierRepository{db: db}
}

func (r *supplierRepository) Create(ctx context.Context, supplier *model.Supplier) error {
	query := `
		INSERT INTO supplier (kode_supplier, nama_supplier, alamat, kota, no_telp, email, contact_person, status_kemitraan, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_supplier`

	supplier.CreatedAt = time.Now()
	err := r.db.QueryRow(ctx, query,
		supplier.KodeSupplier, supplier.NamaSupplier, supplier.Alamat,
		supplier.Kota, supplier.NoTelp, supplier.Email, supplier.ContactPerson,
		supplier.StatusKemitraan, supplier.CreatedAt,
	).Scan(&supplier.ID)

	return err
}

func (r *supplierRepository) GetByID(ctx context.Context, id int) (*model.Supplier, error) {
	query := `
		SELECT id_supplier, kode_supplier, nama_supplier, alamat, kota, no_telp, email, contact_person, status_kemitraan, created_at 
		FROM supplier 
		WHERE id_supplier = $1`

	var s model.Supplier
	err := r.db.QueryRow(ctx, query, id).Scan(
		&s.ID, &s.KodeSupplier, &s.NamaSupplier, &s.Alamat,
		&s.Kota, &s.NoTelp, &s.Email, &s.ContactPerson,
		&s.StatusKemitraan, &s.CreatedAt,
	)
	if err != nil {
		// PERBAIKAN: Menggunakan pgx.ErrNoRows karena koneksi db menggunakan pgxpool
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("supplier tidak ditemukan")
		}
		return nil, err
	}
	return &s, nil
}

func (r *supplierRepository) GetAll(ctx context.Context) ([]model.Supplier, error) {
	// PERBAIKAN: Menambahkan kolom created_at agar sejajar dengan jumlah Scan()
	query := `
		SELECT id_supplier, kode_supplier, nama_supplier, alamat, kota, no_telp, email, contact_person, status_kemitraan, created_at 
		FROM supplier 
		ORDER BY id_supplier DESC`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// PERBAIKAN: Diinisialisasi langsung (slice kosong), agar saat data kosong di DB,
	// kembalian JSON berupa [] (array kosong), BUKAN null, agar frontend React aman.
	suppliers := []model.Supplier{}
	for rows.Next() {
		var s model.Supplier
		if err := rows.Scan(
			&s.ID, &s.KodeSupplier, &s.NamaSupplier, &s.Alamat,
			&s.Kota, &s.NoTelp, &s.Email, &s.ContactPerson,
			&s.StatusKemitraan, &s.CreatedAt,
		); err != nil {
			return nil, err
		}
		suppliers = append(suppliers, s)
	}
	return suppliers, nil
}

func (r *supplierRepository) Update(ctx context.Context, supplier *model.Supplier) error {
	query := `
		UPDATE supplier 
		SET kode_supplier = $1, nama_supplier = $2, alamat = $3, kota = $4, no_telp = $5, email = $6, contact_person = $7, status_kemitraan = $8
		WHERE id_supplier = $9`

	_, err := r.db.Exec(ctx, query,
		supplier.KodeSupplier, supplier.NamaSupplier, supplier.Alamat,
		supplier.Kota, supplier.NoTelp, supplier.Email, supplier.ContactPerson,
		supplier.StatusKemitraan, supplier.ID,
	)
	return err
}

func (r *supplierRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM supplier WHERE id_supplier = $1`

	// Gunakan Exec untuk operasi Delete
	commandTag, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	// Mengecek apakah ada baris yang benar-benar terhapus
	if commandTag.RowsAffected() == 0 {
		return errors.New("supplier tidak ditemukan")
	}

	return nil
}
