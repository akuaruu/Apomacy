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

type customerRepositoryStub struct {
	createFn  func(context.Context, *model.Customer) error
	getByIDFn func(context.Context, int) (*model.Customer, error)
	getAllFn  func(context.Context) ([]model.Customer, error)
	updateFn  func(context.Context, *model.Customer) error
	deleteFn  func(context.Context, int) error
}

func (s *customerRepositoryStub) Create(ctx context.Context, customer *model.Customer) error {
	return s.createFn(ctx, customer)
}
func (s *customerRepositoryStub) GetByID(ctx context.Context, id int) (*model.Customer, error) {
	return s.getByIDFn(ctx, id)
}
func (s *customerRepositoryStub) GetAll(ctx context.Context) ([]model.Customer, error) {
	return s.getAllFn(ctx)
}
func (s *customerRepositoryStub) Update(ctx context.Context, customer *model.Customer) error {
	return s.updateFn(ctx, customer)
}
func (s *customerRepositoryStub) Delete(ctx context.Context, id int) error {
	return s.deleteFn(ctx, id)
}

func TestCustomerUsecaseCreate(t *testing.T) {
	tests := []struct {
		name       string
		customer   *model.Customer
		repoError  error
		wantError  string
		wantCalled bool
	}{
		{name: "success", customer: &model.Customer{NamaCustomer: "Budi", NoTelp: "081234567890"}, wantCalled: true},
		{name: "empty name", customer: &model.Customer{NoTelp: "081234567890"}, wantError: "nama customer tidak boleh kosong"},
		{name: "empty phone", customer: &model.Customer{NamaCustomer: "Budi"}, wantError: "nomor telepon tidak boleh kosong"},
		{name: "repository failure", customer: &model.Customer{NamaCustomer: "Budi", NoTelp: "081234567890"}, repoError: errors.New("database unavailable"), wantError: "database unavailable", wantCalled: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			called := false
			repo := &customerRepositoryStub{createFn: func(_ context.Context, customer *model.Customer) error {
				called = true
				assert.Same(t, test.customer, customer)
				return test.repoError
			}}
			uc := usecase.NewCustomerUsecase(repo)
			err := uc.CreateCustomer(context.Background(), test.customer)
			if test.wantError == "" {
				require.NoError(t, err)
			} else {
				require.EqualError(t, err, test.wantError)
			}
			assert.Equal(t, test.wantCalled, called)
		})
	}
}

func TestCustomerUsecaseReadUpdateDelete(t *testing.T) {
	repoError := errors.New("repository failed")
	existing := &model.Customer{ID: 7, NamaCustomer: "Sari", NoTelp: "081111111111"}
	repo := &customerRepositoryStub{
		getByIDFn: func(_ context.Context, id int) (*model.Customer, error) {
			assert.Equal(t, 7, id)
			return existing, nil
		},
		getAllFn: func(context.Context) ([]model.Customer, error) {
			return []model.Customer{*existing}, nil
		},
		updateFn: func(_ context.Context, customer *model.Customer) error {
			if customer.ID == 99 {
				return repoError
			}
			return nil
		},
		deleteFn: func(_ context.Context, id int) error {
			if id == 99 {
				return repoError
			}
			return nil
		},
	}
	uc := usecase.NewCustomerUsecase(repo)

	t.Run("get by id success", func(t *testing.T) {
		result, err := uc.GetCustomerByID(context.Background(), 7)
		require.NoError(t, err)
		assert.Equal(t, existing, result)
	})
	t.Run("get by id rejects invalid id", func(t *testing.T) {
		result, err := uc.GetCustomerByID(context.Background(), 0)
		require.EqualError(t, err, "ID customer tidak valid")
		assert.Nil(t, result)
	})
	t.Run("get all success", func(t *testing.T) {
		result, err := uc.GetAllCustomers(context.Background())
		require.NoError(t, err)
		require.Len(t, result, 1)
	})
	t.Run("update success", func(t *testing.T) {
		require.NoError(t, uc.UpdateCustomer(context.Background(), existing))
	})
	t.Run("update invalid id", func(t *testing.T) {
		err := uc.UpdateCustomer(context.Background(), &model.Customer{NamaCustomer: "Sari"})
		require.EqualError(t, err, "ID customer tidak valid")
	})
	t.Run("update empty name", func(t *testing.T) {
		err := uc.UpdateCustomer(context.Background(), &model.Customer{ID: 1})
		require.EqualError(t, err, "nama customer tidak boleh kosong")
	})
	t.Run("update repository failure", func(t *testing.T) {
		err := uc.UpdateCustomer(context.Background(), &model.Customer{ID: 99, NamaCustomer: "Sari"})
		require.ErrorIs(t, err, repoError)
	})
	t.Run("delete success", func(t *testing.T) {
		require.NoError(t, uc.DeleteCustomer(context.Background(), 7))
	})
	t.Run("delete invalid id", func(t *testing.T) {
		require.EqualError(t, uc.DeleteCustomer(context.Background(), -1), "ID customer tidak valid")
	})
	t.Run("delete repository failure", func(t *testing.T) {
		require.ErrorIs(t, uc.DeleteCustomer(context.Background(), 99), repoError)
	})
}
