package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
)

type customerRepository struct {
	db DBTx
}

func NewCustomerRepository(db DBTx) model.CustomerRepository {
	return &customerRepository{db: db}
}

func (r *customerRepository) Create(ctx context.Context, customer *model.Customer) error {
	if customer.TanggalDaftar.IsZero() {
		customer.TanggalDaftar = time.Now()
	}

	query := `
		INSERT INTO public.customer (
			no_member,
			nama_customer,
			no_telp,
			email,
			tanggal_daftar,
			id_user
		) VALUES (
			$1, $2, $3, $4, $5, $6
		)
		RETURNING id_customer, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		customer.NoMember,
		customer.NamaCustomer,
		customer.NoTelp,
		customer.Email,
		customer.TanggalDaftar,
		customer.IDUser,
	).Scan(
		&customer.ID,
		&customer.CreatedAt,
		&customer.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("gagal insert customer: %v", err)
	}

	return nil
}

func (r *customerRepository) GetByID(ctx context.Context, id int) (*model.Customer, error) {
	query := `
		SELECT id_customer, no_member, nama_customer, no_telp, alamat, 
		       tanggal_lahir, jenis_kelamin, email, tanggal_daftar, created_at, updated_at 
		FROM customer 
		WHERE id_customer = $1
	`

	var c model.Customer
	err := r.db.QueryRow(ctx, query, id).Scan(
		&c.ID, &c.NoMember, &c.NamaCustomer, &c.NoTelp, &c.Alamat,
		&c.TanggalLahir, &c.JenisKelamin, &c.Email, &c.TanggalDaftar,
		&c.CreatedAt, &c.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("customer tidak ditemukan: %v", err)
	}
	return &c, nil
}

func (r *customerRepository) GetAll(ctx context.Context) ([]model.Customer, error) {
	query := `
		SELECT id_customer, no_member, nama_customer, no_telp, alamat, 
		       tanggal_lahir, jenis_kelamin, email, tanggal_daftar, created_at, updated_at 
		FROM customer 
		ORDER BY nama_customer ASC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil data customer: %v", err)
	}
	defer rows.Close()

	var customers []model.Customer
	for rows.Next() {
		var c model.Customer
		err := rows.Scan(
			&c.ID, &c.NoMember, &c.NamaCustomer, &c.NoTelp, &c.Alamat,
			&c.TanggalLahir, &c.JenisKelamin, &c.Email, &c.TanggalDaftar,
			&c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan data customer: %v", err)
		}
		customers = append(customers, c)
	}

	return customers, nil
}

func (r *customerRepository) Update(ctx context.Context, customer *model.Customer) error {
	query := `
		UPDATE customer SET 
			nama_customer = $1, 
			no_telp = $2, 
			alamat = $3, 
			email = $4,
			tanggal_lahir = $5,
			jenis_kelamin = $6
		WHERE id_customer = $7 
		RETURNING updated_at
	`

	err := r.db.QueryRow(ctx, query,
		customer.NamaCustomer,
		customer.NoTelp,
		customer.Alamat,
		customer.Email,
		customer.TanggalLahir,
		customer.JenisKelamin,
		customer.ID,
	).Scan(&customer.UpdatedAt)

	if err != nil {
		return fmt.Errorf("gagal update customer: %v", err)
	}
	return nil
}

func (r *customerRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM customer WHERE id_customer = $1`

	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal delete customer: %v", err)
	}

	return nil
}
