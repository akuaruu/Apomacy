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
	TxMenungguPembayaran StatusTransaksi = "menunggu_pembayaran"
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

	// Relasi untuk memudahkan balikan JSON API
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
	// Transaksi menggunakan pattern DB Transaction (BEGIN, COMMIT, ROLLBACK)
	CreateWithDetails(ctx context.Context, tx *Transaksi) error
	GetByID(ctx context.Context, id int) (*Transaksi, error)
	UpdateStatus(ctx context.Context, id int, status StatusTransaksi) error
	UpdateStatusByNoTransaksi(ctx context.Context, noTransaksi string, status StatusTransaksi) error
}

type TransaksiUsecase interface {
	Checkout(ctx context.Context, tx *Transaksi) error // Logic kurangi stok ada di sini
	GetDetailTransaksi(ctx context.Context, id int) (*Transaksi, error)
	BatalkanTransaksi(ctx context.Context, id int) error // Logic kembalikan stok
	UpdateStatusByNoTransaksi(ctx context.Context, noTransaksi string, status StatusTransaksi) error
}
