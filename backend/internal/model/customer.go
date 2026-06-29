package model

import (
	"context"
	"time"
)

type JenisKelamin string

const (
	KelaminLaki JenisKelamin = "L"
	KelaminPr   JenisKelamin = "P"
)

type Customer struct {
	ID            int           `json:"id_customer"`
	NoMember      string        `json:"no_member"`
	NamaCustomer  string        `json:"nama_customer"`
	NoTelp        string        `json:"no_telp"`
	Alamat        *string       `json:"alamat"`
	TanggalLahir  *time.Time    `json:"tanggal_lahir"`
	JenisKelamin  *JenisKelamin `json:"jenis_kelamin"`
	Email         *string       `json:"email"`
	TanggalDaftar time.Time     `json:"tanggal_daftar"`
	CreatedAt     time.Time     `json:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at"`
	IDUser        *int          `json:"id_user"`
}

type CustomerRepository interface {
	Create(ctx context.Context, customer *Customer) error
	GetByID(ctx context.Context, id int) (*Customer, error)
	GetAll(ctx context.Context) ([]Customer, error)
	Update(ctx context.Context, customer *Customer) error
	Delete(ctx context.Context, id int) error
}

type CustomerUsecase interface {
	CreateCustomer(ctx context.Context, customer *Customer) error
	GetCustomerByID(ctx context.Context, id int) (*Customer, error)
	GetAllCustomers(ctx context.Context) ([]Customer, error)
	UpdateCustomer(ctx context.Context, customer *Customer) error
	DeleteCustomer(ctx context.Context, id int) error
}
