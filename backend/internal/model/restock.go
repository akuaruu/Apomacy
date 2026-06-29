package model

import (
	"context"
	"time"
)

type Restock struct {
	ID                   int       `json:"id_restock"`
	IDSupplier           int       `json:"id_supplier"`
	IDUser               int       `json:"id_user"`
	NoFakturSupplier     string    `json:"no_faktur_supplier"`
	NoPenerimaanInternal string    `json:"no_penerimaan_internal"`
	TanggalRestock       time.Time `json:"tanggal_restock"`
	TotalBayar           float64   `json:"total_bayar"`
	Keterangan           *string   `json:"keterangan"`

	Details []DetailRestock `json:"details,omitempty"`
}

type DetailRestock struct {
	IDDetailRestock   int       `json:"id_detail_restock"`
	IDRestock         int       `json:"id_restock"`
	IDObat            int       `json:"id_obat"`
	HargaBeli         float64   `json:"harga_beli"`
	Jumlah            int       `json:"jumlah"`
	TanggalKadaluarsa time.Time `json:"tanggal_kadaluarsa"`
	Subtotal          float64   `json:"subtotal"`
}

type RestockRepository interface {
	CreateWithDetails(ctx context.Context, restock *Restock) error
	GetByID(ctx context.Context, id int) (*Restock, error)
}

type RestockUsecase interface {
	ProcessRestock(ctx context.Context, restock *Restock) error // Logic tambah stok ada di sini
	GetRestockDetail(ctx context.Context, id int) (*Restock, error)
}
