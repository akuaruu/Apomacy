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

	// Pemanggilan repository yang sudah mencakup pemotongan stok via DB Transaction
	return t.repo.CreateWithDetails(ctx, tx)
}

func (t *transaksiUsecase) GetDetailTransaksi(ctx context.Context, id int) (*model.Transaksi, error) {
	return t.repo.GetByID(ctx, id)
}

func (t *transaksiUsecase) BatalkanTransaksi(ctx context.Context, id int) error {
	// Catatan: Jika ingin lebih kompleks,harus menarik DetailTransaksi
	// dan menambahkan kembali stoknya ke tabel obat.
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
