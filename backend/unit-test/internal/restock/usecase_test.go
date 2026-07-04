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

type restockRepositoryStub struct {
	createFn func(context.Context, *model.Restock) error
	getFn    func(context.Context, int) (*model.Restock, error)
}

func (s *restockRepositoryStub) CreateWithDetails(ctx context.Context, restock *model.Restock) error {
	return s.createFn(ctx, restock)
}
func (s *restockRepositoryStub) GetByID(ctx context.Context, id int) (*model.Restock, error) {
	return s.getFn(ctx, id)
}

func TestRestockUsecaseProcess(t *testing.T) {
	backendError := errors.New("repository failed")
	tests := []struct {
		name      string
		restock   *model.Restock
		repoError error
		wantError string
	}{
		{name: "success", restock: &model.Restock{IDSupplier: 1, Details: []model.DetailRestock{{IDObat: 2, Jumlah: 5, HargaBeli: 1000}}}},
		{name: "missing items", restock: &model.Restock{IDSupplier: 1}, wantError: "tidak ada item obat yang direstock"},
		{name: "missing supplier", restock: &model.Restock{Details: []model.DetailRestock{{Jumlah: 1, HargaBeli: 1000}}}, wantError: "supplier tidak boleh kosong"},
		{name: "invalid quantity", restock: &model.Restock{IDSupplier: 1, Details: []model.DetailRestock{{Jumlah: 0, HargaBeli: 1000}}}, wantError: "jumlah item tidak boleh 0 atau minus"},
		{name: "invalid purchase price", restock: &model.Restock{IDSupplier: 1, Details: []model.DetailRestock{{Jumlah: 1, HargaBeli: 0}}}, wantError: "harga beli item tidak valid"},
		{name: "repository failure", restock: &model.Restock{IDSupplier: 1, Details: []model.DetailRestock{{Jumlah: 1, HargaBeli: 1000}}}, repoError: backendError, wantError: backendError.Error()},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			called := false
			repo := &restockRepositoryStub{createFn: func(context.Context, *model.Restock) error { called = true; return test.repoError }}
			err := usecase.NewRestockUsecase(repo).ProcessRestock(context.Background(), test.restock)
			if test.wantError != "" {
				require.EqualError(t, err, test.wantError)
				if test.repoError == nil {
					assert.False(t, called)
				}
				return
			}
			require.NoError(t, err)
			assert.True(t, called)
		})
	}
}

func TestRestockUsecaseGetDetail(t *testing.T) {
	want := &model.Restock{ID: 8}
	repo := &restockRepositoryStub{getFn: func(_ context.Context, id int) (*model.Restock, error) { assert.Equal(t, 8, id); return want, nil }}
	got, err := usecase.NewRestockUsecase(repo).GetRestockDetail(context.Background(), 8)
	require.NoError(t, err)
	assert.Same(t, want, got)
}
