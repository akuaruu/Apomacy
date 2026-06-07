package model

import (
	"context"
	"time"
)

type Obat struct {
	ID          int       `json:"id_obat"`
	IDSupplier  int       `json:"id_supplier"`
	KodeObat    string    `json:"kode_obat"`
	NamaObat    string    `json:"nama_obat" form:"nama_obat"`
	JenisObat   string    `json:"jenis_obat"`
	BentukObat  string    `json:"bentuk_obat"`
	Satuan      string    `json:"satuan"`
	HargaBeli   float64   `json:"harga_beli"`
	HargaJual   float64   `json:"harga_jual"`
	Stok        int       `json:"stok"`
	StokMinimum int       `json:"stok_minimum"`
	ExpiredDate time.Time `json:"expired_date"`

	GambarProduk *string `json:"gambar_produk"`

	DosisPemakaian string    `json:"dosis_pemakaian"`
	Komposisi      string    `json:"komposisi"`
	Deskripsi      string    `json:"deskripsi"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updateed_at"`
}

type ObatUsecase interface {
	CreateObat(ctx context.Context, obat *Obat) error
	GetObatByID(ctx context.Context, id int) (*Obat, error)
	GetAllObat(ctx context.Context) ([]Obat, error)
	UpdateObat(ctx context.Context, obat *Obat) error
	DeleteObat(ctx context.Context, id int) error
}

type ObatRepository interface {
	Create(ctx context.Context, obat *Obat) error
	GetByID(ctx context.Context, id int) (*Obat, error)
	GetAll(ctx context.Context) ([]Obat, error)
	Update(ctx context.Context, obat *Obat) error
	Delete(ctx context.Context, id int) error
}
