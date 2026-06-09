package usecase

import (
	"context"
	"errors"

	"github.com/akuaruu/apomacy/backend/internal/model"
)

type customerUsecase struct {
	repo model.CustomerRepository
}

func NewCustomerUsecase(repo model.CustomerRepository) model.CustomerUsecase {
	return &customerUsecase{repo: repo}
}

func (u *customerUsecase) CreateCustomer(ctx context.Context, customer *model.Customer) error {
	// Contoh Business Logic / Validasi
	if customer.NamaCustomer == "" {
		return errors.New("nama customer tidak boleh kosong")
	}
	if customer.NoTelp == "" {
		return errors.New("nomor telepon tidak boleh kosong")
	}

	return u.repo.Create(ctx, customer)
}

func (u *customerUsecase) GetCustomerByID(ctx context.Context, id int) (*model.Customer, error) {
	if id <= 0 {
		return nil, errors.New("ID customer tidak valid")
	}
	return u.repo.GetByID(ctx, id)
}

func (u *customerUsecase) GetAllCustomers(ctx context.Context) ([]model.Customer, error) {
	return u.repo.GetAll(ctx)
}

func (u *customerUsecase) UpdateCustomer(ctx context.Context, customer *model.Customer) error {
	if customer.ID <= 0 {
		return errors.New("ID customer tidak valid")
	}
	if customer.NamaCustomer == "" {
		return errors.New("nama customer tidak boleh kosong")
	}

	return u.repo.Update(ctx, customer)
}

func (u *customerUsecase) DeleteCustomer(ctx context.Context, id int) error {
	if id <= 0 {
		return errors.New("ID customer tidak valid")
	}
	return u.repo.Delete(ctx, id)
}
