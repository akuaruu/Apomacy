package model

import (
	"context"
	"time"
)

type StatusKemitraan string

const (
	KemitraanActive   StatusKemitraan = "Aktif"
	KemitraanInactive StatusKemitraan = "Tidak Aktif"
)

type Supplier struct {
	ID              int             `json:"id_supplier"`
	KodeSupplier    string          `json:"kode_supplier"`
	NamaSupplier    string          `json:"nama_supplier"`
	Alamat          string          `json:"alamat"`
	Kota            string          `json:"kota"`
	NoTelp          string          `json:"no_telp"`
	Email           *string         `json:"email"`
	ContactPerson   *string         `json:"contact_person"`
	StatusKemitraan StatusKemitraan `json:"status_kemitraan"`
	CreatedAt       time.Time       `json:"created_at"`
}

type SupplierRepository interface {
	Create(ctx context.Context, supplier *Supplier) error
	GetByID(ctx context.Context, id int) (*Supplier, error)
	GetAll(ctx context.Context) ([]Supplier, error)
	Update(ctx context.Context, supplier *Supplier) error
	Delete(ctx context.Context, id int) error
}

type SupplierUsecase interface {
	CreateSupplier(ctx context.Context, supplier *Supplier) error
	GetSupplierByID(ctx context.Context, id int) (*Supplier, error)
	GetAllSuppliers(ctx context.Context) ([]Supplier, error)
	UpdateSupplier(ctx context.Context, supplier *Supplier) error
	DeleteSupplier(ctx context.Context, id int) error
}
