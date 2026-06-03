package usecase

import (
	"context"
	"errors"

	"github.com/akuaruu/apomacy/backend/internal/model"
)

type obatUsecase struct {
	repo model.ObatRepository
}

// Injeksi dependensi: Usecase butuh Repository
func NewObatUsecase(repo model.ObatRepository) model.ObatUsecase {
	return &obatUsecase{repo: repo}
}

func (u *obatUsecase) CreateObat(ctx context.Context, obat *model.Obat) error {
	// Contoh Business Logic / Validasi
	if obat.HargaJual <= obat.HargaBeli {
		return errors.New("harga jual harus lebih besar dari harga beli")
	}
	if obat.Stok < 0 {
		return errors.New("stok tidak boleh minus")
	}

	return u.repo.Create(ctx, obat)
}

func (u *obatUsecase) GetObatByID(ctx context.Context, id int) (*model.Obat, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *obatUsecase) GetAllObat(ctx context.Context) ([]model.Obat, error) {
	return u.repo.GetAll(ctx)
}

func (u *obatUsecase) UpdateObat(ctx context.Context, obat *model.Obat) error {
	if obat.HargaJual <= obat.HargaBeli {
		return errors.New("harga jual harus lebih besar dari harga beli")
	}
	return u.repo.Update(ctx, obat)
}

func (u *obatUsecase) DeleteObat(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
