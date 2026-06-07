package usecase

import (
	"context"
	"errors"

	"github.com/akuaruu/apomacy/backend/internal/model"
)

type restockUsecase struct {
	repo model.RestockRepository
}

func NewRestockUsecase(repo model.RestockRepository) model.RestockUsecase {
	return &restockUsecase{repo: repo}
}

// Berubah dari CreateRestock menjadi ProcessRestock agar sesuai dengan restock.go
func (u *restockUsecase) ProcessRestock(ctx context.Context, restock *model.Restock) error {
	if len(restock.Details) == 0 {
		return errors.New("tidak ada item obat yang direstock")
	}
	if restock.IDSupplier == 0 {
		return errors.New("supplier tidak boleh kosong")
	}

	for _, item := range restock.Details {
		if item.Jumlah <= 0 {
			return errors.New("jumlah item tidak boleh 0 atau minus")
		}
		if item.HargaBeli <= 0 {
			return errors.New("harga beli item tidak valid")
		}
	}

	// Panggil repo dengan metode yang sudah disesuaikan
	return u.repo.CreateWithDetails(ctx, restock)
}

func (u *restockUsecase) GetRestockDetail(ctx context.Context, id int) (*model.Restock, error) {
	return u.repo.GetByID(ctx, id)
}
