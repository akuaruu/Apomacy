package usecase

import (
	"context"
	"errors"

	"github.com/akuaruu/apomacy/backend/internal/model"
)

type supplierUsecase struct {
	repo model.SupplierRepository
}

func NewSupplierUsecase(repo model.SupplierRepository) model.SupplierUsecase {
	return &supplierUsecase{repo: repo}
}

func (u *supplierUsecase) CreateSupplier(ctx context.Context, supplier *model.Supplier) error {
	if supplier.KodeSupplier == "" || supplier.NamaSupplier == "" {
		return errors.New("kode dan nama supplier wajib diisi")
	}
	if supplier.StatusKemitraan == "" {
		supplier.StatusKemitraan = model.KemitraanActive
	}
	return u.repo.Create(ctx, supplier)
}

func (u *supplierUsecase) GetSupplierByID(ctx context.Context, id int) (*model.Supplier, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *supplierUsecase) GetAllSuppliers(ctx context.Context) ([]model.Supplier, error) {
	return u.repo.GetAll(ctx)
}

func (u *supplierUsecase) UpdateSupplier(ctx context.Context, supplier *model.Supplier) error {
	if supplier.KodeSupplier == "" || supplier.NamaSupplier == "" {
		return errors.New("kode dan nama supplier wajib diisi")
	}
	return u.repo.Update(ctx, supplier)
}
