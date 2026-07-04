package unittest

import (
	"context"
	"errors"
	"testing"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/akuaruu/apomacy/backend/internal/usecase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type supplierRepositoryStub struct {
	createFn  func(context.Context, *model.Supplier) error
	getByIDFn func(context.Context, int) (*model.Supplier, error)
	getAllFn  func(context.Context) ([]model.Supplier, error)
	updateFn  func(context.Context, *model.Supplier) error
	deleteFn  func(context.Context, int) error
}

func (s *supplierRepositoryStub) Create(ctx context.Context, value *model.Supplier) error {
	return s.createFn(ctx, value)
}
func (s *supplierRepositoryStub) GetByID(ctx context.Context, id int) (*model.Supplier, error) {
	return s.getByIDFn(ctx, id)
}
func (s *supplierRepositoryStub) GetAll(ctx context.Context) ([]model.Supplier, error) {
	return s.getAllFn(ctx)
}
func (s *supplierRepositoryStub) Update(ctx context.Context, value *model.Supplier) error {
	return s.updateFn(ctx, value)
}
func (s *supplierRepositoryStub) Delete(ctx context.Context, id int) error {
	return s.deleteFn(ctx, id)
}

func TestSupplierUsecaseCreateAndUpdate(t *testing.T) {
	repoError := errors.New("repository failed")
	repo := &supplierRepositoryStub{
		createFn: func(_ context.Context, supplier *model.Supplier) error {
			if supplier.KodeSupplier == "ERR" {
				return repoError
			}
			return nil
		},
		updateFn: func(_ context.Context, supplier *model.Supplier) error {
			if supplier.KodeSupplier == "ERR" {
				return repoError
			}
			return nil
		},
	}
	uc := usecase.NewSupplierUsecase(repo)

	t.Run("create sets default active status", func(t *testing.T) {
		supplier := &model.Supplier{KodeSupplier: "SUP-1", NamaSupplier: "Sehat Farma"}
		require.NoError(t, uc.CreateSupplier(context.Background(), supplier))
		assert.Equal(t, model.KemitraanActive, supplier.StatusKemitraan)
	})
	t.Run("create rejects missing code", func(t *testing.T) {
		err := uc.CreateSupplier(context.Background(), &model.Supplier{NamaSupplier: "Sehat Farma"})
		require.EqualError(t, err, "kode dan nama supplier wajib diisi")
	})
	t.Run("create propagates repository failure", func(t *testing.T) {
		err := uc.CreateSupplier(context.Background(), &model.Supplier{KodeSupplier: "ERR", NamaSupplier: "Sehat Farma"})
		require.ErrorIs(t, err, repoError)
	})
	t.Run("update success", func(t *testing.T) {
		require.NoError(t, uc.UpdateSupplier(context.Background(), &model.Supplier{KodeSupplier: "SUP-1", NamaSupplier: "Sehat Farma"}))
	})
	t.Run("update rejects missing name", func(t *testing.T) {
		err := uc.UpdateSupplier(context.Background(), &model.Supplier{KodeSupplier: "SUP-1"})
		require.EqualError(t, err, "kode dan nama supplier wajib diisi")
	})
	t.Run("update propagates repository failure", func(t *testing.T) {
		err := uc.UpdateSupplier(context.Background(), &model.Supplier{KodeSupplier: "ERR", NamaSupplier: "Sehat Farma"})
		require.ErrorIs(t, err, repoError)
	})
}

func TestSupplierUsecaseReadDelete(t *testing.T) {
	repoError := errors.New("repository failed")
	existing := &model.Supplier{ID: 4, KodeSupplier: "SUP-4", NamaSupplier: "Medika"}
	repo := &supplierRepositoryStub{
		getByIDFn: func(_ context.Context, id int) (*model.Supplier, error) {
			if id == 99 {
				return nil, repoError
			}
			return existing, nil
		},
		getAllFn: func(context.Context) ([]model.Supplier, error) { return []model.Supplier{*existing}, nil },
		deleteFn: func(_ context.Context, id int) error {
			if id == 99 {
				return repoError
			}
			return nil
		},
	}
	uc := usecase.NewSupplierUsecase(repo)

	result, err := uc.GetSupplierByID(context.Background(), 4)
	require.NoError(t, err)
	assert.Equal(t, existing, result)

	_, err = uc.GetSupplierByID(context.Background(), 99)
	require.ErrorIs(t, err, repoError)

	list, err := uc.GetAllSuppliers(context.Background())
	require.NoError(t, err)
	require.Len(t, list, 1)

	require.NoError(t, uc.DeleteSupplier(context.Background(), 4))
	require.ErrorIs(t, uc.DeleteSupplier(context.Background(), 99), repoError)
}
