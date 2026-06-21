package usecase

import (
	"context"
	"errors"

	"github.com/akuaruu/apomacy/backend/internal/model"
)

type transaksiUsecase struct {
	repo model.TransaksiRepository
}

func NewTransaksiUsecase(repo model.TransaksiRepository) model.TransaksiUsecase {
	return &transaksiUsecase{repo: repo}
}

func (t *transaksiUsecase) Checkout(ctx context.Context, tx *model.Transaksi) error {
	if len(tx.Details) == 0 {
		return errors.New("keranjang belanja tidak boleh kosong")
	}

	if tx.TotalBayar < tx.Subtotal {
		return errors.New("total bayar tidak mencukupi")
	}

	if tx.Pengiriman != nil {
		if tx.Pengiriman.MetodePenerimaan == "delivery" {
			if tx.Pengiriman.AlamatPengiriman == nil || *tx.Pengiriman.AlamatPengiriman == "" {
				return errors.New("alamat pengiriman wajib diisi untuk metode delivery")
			}
		} else if tx.Pengiriman.MetodePenerimaan == "pickup" {
			if tx.Pengiriman.NamaPenerima == nil || *tx.Pengiriman.NamaPenerima == "" {
				return errors.New("nama pengambil wajib diisi untuk metode pickup")
			}
		}
	}

	return t.repo.CreateWithDetails(ctx, tx)
}

// GetDetailTransaksi memastikan hanya pemilik transaksi atau staff (kasir/admin) yang dapat mengakses data
func (t *transaksiUsecase) GetDetailTransaksi(ctx context.Context, idUser int, isStaff bool, id int) (*model.Transaksi, error) {
	trx, err := t.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if !isStaff && trx.IDUser != idUser {
		return nil, errors.New("akses ditolak: transaksi ini bukan milik anda")
	}

	return trx, nil
}

func (t *transaksiUsecase) BatalkanTransaksi(ctx context.Context, id int) error {
	return t.repo.UpdateStatus(ctx, id, model.TxBatal)
}

func (u *transaksiUsecase) UpdateStatusByNoTransaksi(ctx context.Context, noTransaksi string, status model.StatusTransaksi) error {
	return u.repo.UpdateStatusByNoTransaksi(ctx, noTransaksi, status)
}

func (t *transaksiUsecase) GetRiwayatByUser(ctx context.Context, idUser int) ([]*model.Transaksi, error) {
	return t.repo.GetByUserID(ctx, idUser)
}

func (t *transaksiUsecase) GetAll(ctx context.Context) ([]model.Transaksi, error) {
	return t.repo.GetAll(ctx)
}

func (t *transaksiUsecase) UpdateStatusPesanan(ctx context.Context, noTransaksi string, statusPesanan string) error {
	validStatus := map[string]bool{
		"Menunggu Pembayaran": true,
		"Menunggu Diproses":   true,
		"Sedang Diracik":      true,
		"Sedang Dikirim":      true,
		"Siap Diambil":        true,
		"Selesai":             true,
		"Dibatalkan":          true,
	}

	if !validStatus[statusPesanan] {
		return errors.New("status pesanan tidak valid: " + statusPesanan)
	}

	return t.repo.UpdateStatusPesanan(ctx, noTransaksi, statusPesanan)
}
