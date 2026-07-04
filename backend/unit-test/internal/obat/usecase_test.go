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

type obatRepositoryStub struct {
	createFn  func(context.Context, *model.Obat) error
	getByIDFn func(context.Context, int) (*model.Obat, error)
	getAllFn  func(context.Context) ([]model.Obat, error)
	updateFn  func(context.Context, *model.Obat) error
	deleteFn  func(context.Context, int) error
}

func (s *obatRepositoryStub) Create(ctx context.Context, value *model.Obat) error {
	return s.createFn(ctx, value)
}
func (s *obatRepositoryStub) GetByID(ctx context.Context, id int) (*model.Obat, error) {
	return s.getByIDFn(ctx, id)
}
func (s *obatRepositoryStub) GetAll(ctx context.Context) ([]model.Obat, error) {
	return s.getAllFn(ctx)
}
func (s *obatRepositoryStub) Update(ctx context.Context, value *model.Obat) error {
	return s.updateFn(ctx, value)
}
func (s *obatRepositoryStub) Delete(ctx context.Context, id int) error {
	return s.deleteFn(ctx, id)
}

func TestObatUsecaseCreateAndUpdate(t *testing.T) {
	repoError := errors.New("repository failed")
	repo := &obatRepositoryStub{
		createFn: func(_ context.Context, obat *model.Obat) error {
			if obat.KodeObat == "ERR" {
				return repoError
			}
			return nil
		},
		updateFn: func(_ context.Context, obat *model.Obat) error {
			if obat.KodeObat == "ERR" {
				return repoError
			}
			return nil
		},
	}
	uc := usecase.NewObatUsecase(repo)

	tests := []struct {
		name      string
		operation string
		obat      *model.Obat
		wantError string
	}{
		{name: "create success", operation: "create", obat: &model.Obat{KodeObat: "OBT-1", HargaBeli: 5000, HargaJual: 7000, Stok: 1}},
		{name: "create rejects equal price", operation: "create", obat: &model.Obat{HargaBeli: 5000, HargaJual: 5000}, wantError: "harga jual harus lebih besar dari harga beli"},
		{name: "create rejects negative stock", operation: "create", obat: &model.Obat{HargaBeli: 5000, HargaJual: 7000, Stok: -1}, wantError: "stok tidak boleh minus"},
		{name: "create repository failure", operation: "create", obat: &model.Obat{KodeObat: "ERR", HargaBeli: 5000, HargaJual: 7000}, wantError: "repository failed"},
		{name: "update success", operation: "update", obat: &model.Obat{KodeObat: "OBT-1", HargaBeli: 5000, HargaJual: 7000}},
		{name: "update rejects invalid price", operation: "update", obat: &model.Obat{HargaBeli: 7000, HargaJual: 6000}, wantError: "harga jual harus lebih besar dari harga beli"},
		{name: "update repository failure", operation: "update", obat: &model.Obat{KodeObat: "ERR", HargaBeli: 5000, HargaJual: 7000}, wantError: "repository failed"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			var err error
			if test.operation == "create" {
				err = uc.CreateObat(context.Background(), test.obat)
			} else {
				err = uc.UpdateObat(context.Background(), test.obat)
			}
			if test.wantError == "" {
				require.NoError(t, err)
			} else {
				require.EqualError(t, err, test.wantError)
			}
		})
	}
}

func TestObatUsecaseReadDelete(t *testing.T) {
	repoError := errors.New("repository failed")
	existing := &model.Obat{ID: 3, KodeObat: "OBT-3"}
	repo := &obatRepositoryStub{
		getByIDFn: func(_ context.Context, id int) (*model.Obat, error) {
			if id == 99 {
				return nil, repoError
			}
			return existing, nil
		},
		getAllFn: func(context.Context) ([]model.Obat, error) { return []model.Obat{*existing}, nil },
		deleteFn: func(_ context.Context, id int) error {
			if id == 99 {
				return repoError
			}
			return nil
		},
	}
	uc := usecase.NewObatUsecase(repo)

	result, err := uc.GetObatByID(context.Background(), 3)
	require.NoError(t, err)
	assert.Equal(t, existing, result)
	_, err = uc.GetObatByID(context.Background(), 99)
	require.ErrorIs(t, err, repoError)
	list, err := uc.GetAllObat(context.Background())
	require.NoError(t, err)
	require.Len(t, list, 1)
	require.NoError(t, uc.DeleteObat(context.Background(), 3))
	require.ErrorIs(t, uc.DeleteObat(context.Background(), 99), repoError)
}
