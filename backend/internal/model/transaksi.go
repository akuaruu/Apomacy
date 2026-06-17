package model

import (
	"context"
	"time"
)

type MetodePembayaran string

const (
	MetodeTunai    MetodePembayaran = "Tunai"
	MetodeDebit    MetodePembayaran = "Debit"
	MetodeQRIS     MetodePembayaran = "QRIS"
	MetodeTransfer MetodePembayaran = "Transfer"
)

type StatusTransaksi string

const (
	TxSelesai            StatusTransaksi = "Selesai"
	TxPending            StatusTransaksi = "Pending"
	TxBatal              StatusTransaksi = "Batal"
	TxMenungguPembayaran StatusTransaksi = "Pending"
)

type Transaksi struct {
	ID               int              `json:"id_transaksi"`
	IDCustomer       *int             `json:"id_customer"`
	IDUser           int              `json:"id_user"`
	NoTransaksi      string           `json:"no_transaksi"`
	TanggalTransaksi time.Time        `json:"tanggal_transaksi"`
	NamaCustomer     *string          `json:"nama_customer"`
	TotalItem        int              `json:"total_item"`
	Subtotal         float64          `json:"subtotal"`
	TotalBayar       float64          `json:"total_bayar"`
	MetodePembayaran MetodePembayaran `json:"metode_pembayaran"`
	ResepRequired    bool             `json:"resep_required"`
	NoResep          *string          `json:"no_resep"`
	Status           StatusTransaksi  `json:"status"`
	StatusPesanan    string           `json:"status_pesanan"` // BARIS BARU

	Details []DetailTransaksi `json:"details,omitempty"`
}

type DetailTransaksi struct {
	IDDetailTrx int     `json:"id_detail_trx"`
	IDTransaksi int     `json:"id_transaksi"`
	IDObat      int     `json:"id_obat"`
	NamaObat    string  `json:"nama_obat"`
	HargaSatuan float64 `json:"harga_satuan"`
	Qty         int     `json:"qty"`
	Subtotal    float64 `json:"subtotal"`
}

type TransaksiRepository interface {
	CreateWithDetails(ctx context.Context, tx *Transaksi) error
	GetByID(ctx context.Context, id int) (*Transaksi, error)
	UpdateStatus(ctx context.Context, id int, status StatusTransaksi) error
	UpdateStatusByNoTransaksi(ctx context.Context, noTransaksi string, status StatusTransaksi) error
	GetByUserID(ctx context.Context, idUser int) ([]*Transaksi, error)
	GetAll(ctx context.Context) ([]Transaksi, error)
	UpdateStatusPesanan(ctx context.Context, id int, statusPesanan string) error // BARIS BARU
}

type TransaksiUsecase interface {
	Checkout(ctx context.Context, tx *Transaksi) error
	GetDetailTransaksi(ctx context.Context, id int) (*Transaksi, error)
	BatalkanTransaksi(ctx context.Context, id int) error
	UpdateStatusByNoTransaksi(ctx context.Context, noTransaksi string, status StatusTransaksi) error
	GetRiwayatByUser(ctx context.Context, idUser int) ([]*Transaksi, error)
	GetAll(ctx context.Context) ([]Transaksi, error)
	UpdateStatusPesanan(ctx context.Context, id int, statusPesanan string) error // BARIS BARU
}
