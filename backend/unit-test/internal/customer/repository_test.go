package unittest

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/akuaruu/apomacy/backend/internal/repository"
	"github.com/pashagolub/pgxmock/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func sampleCustomer() *model.Customer {
	alamat := "Jl. Sehat"
	email := "budi@example.com"
	gender := model.KelaminLaki
	birth := time.Date(2000, 1, 2, 0, 0, 0, 0, time.UTC)
	userID := 3
	return &model.Customer{NoMember: "MBR000003", NamaCustomer: "Budi", NoTelp: "0812", Alamat: &alamat, TanggalLahir: &birth, JenisKelamin: &gender, Email: &email, IDUser: &userID}
}

func TestCustomerRepositoryCreate(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewCustomerRepository(db)
	customer := sampleCustomer()
	createdAt := time.Now()

	db.ExpectQuery("INSERT INTO public.customer").WithArgs(
		customer.NoMember, customer.NamaCustomer, customer.NoTelp, customer.Alamat,
		customer.TanggalLahir, customer.JenisKelamin, customer.Email, pgxmock.AnyArg(), customer.IDUser,
	).WillReturnRows(pgxmock.NewRows([]string{"id_customer", "created_at", "updated_at"}).AddRow(10, createdAt, createdAt))

	require.NoError(t, repo.Create(context.Background(), customer))
	assert.Equal(t, 10, customer.ID)
	assert.False(t, customer.TanggalDaftar.IsZero())
	require.NoError(t, db.ExpectationsWereMet())
}

func TestCustomerRepositoryCreateFailure(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewCustomerRepository(db)
	customer := sampleCustomer()
	db.ExpectQuery("INSERT INTO public.customer").WithArgs(
		customer.NoMember, customer.NamaCustomer, customer.NoTelp, customer.Alamat,
		customer.TanggalLahir, customer.JenisKelamin, customer.Email, pgxmock.AnyArg(), customer.IDUser,
	).WillReturnError(errors.New("insert failed"))

	err = repo.Create(context.Background(), customer)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "gagal insert customer")
	require.NoError(t, db.ExpectationsWereMet())
}

func TestCustomerRepositoryReadUpdateDelete(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewCustomerRepository(db)
	customer := sampleCustomer()
	now := time.Now()
	columns := []string{"id_customer", "no_member", "nama_customer", "no_telp", "alamat", "tanggal_lahir", "jenis_kelamin", "email", "tanggal_daftar", "created_at", "updated_at", "id_user"}
	row := []any{10, customer.NoMember, customer.NamaCustomer, customer.NoTelp, customer.Alamat, customer.TanggalLahir, customer.JenisKelamin, customer.Email, now, now, now, customer.IDUser}

	db.ExpectQuery("SELECT id_customer.*FROM customer.*WHERE id_customer").WithArgs(10).WillReturnRows(pgxmock.NewRows(columns).AddRow(row...))
	result, err := repo.GetByID(context.Background(), 10)
	require.NoError(t, err)
	assert.Equal(t, "Budi", result.NamaCustomer)

	db.ExpectQuery("SELECT id_customer.*FROM customer.*ORDER BY nama_customer").WillReturnRows(pgxmock.NewRows(columns).AddRow(row...))
	list, err := repo.GetAll(context.Background())
	require.NoError(t, err)
	require.Len(t, list, 1)

	customer.ID = 10
	db.ExpectQuery("UPDATE customer SET").WithArgs(customer.NamaCustomer, customer.NoTelp, customer.Alamat, customer.Email, customer.TanggalLahir, customer.JenisKelamin, customer.ID).WillReturnRows(pgxmock.NewRows([]string{"updated_at"}).AddRow(now))
	require.NoError(t, repo.Update(context.Background(), customer))

	db.ExpectExec("DELETE FROM customer").WithArgs(10).WillReturnResult(pgxmock.NewResult("DELETE", 1))
	require.NoError(t, repo.Delete(context.Background(), 10))
	require.NoError(t, db.ExpectationsWereMet())
}

func TestCustomerRepositoryFailures(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewCustomerRepository(db)

	db.ExpectQuery("SELECT id_customer.*WHERE id_customer").WithArgs(9).WillReturnError(errors.New("read failed"))
	result, err := repo.GetByID(context.Background(), 9)
	require.Error(t, err)
	assert.Nil(t, result)

	db.ExpectQuery("SELECT id_customer.*ORDER BY nama_customer").WillReturnError(errors.New("list failed"))
	_, err = repo.GetAll(context.Background())
	require.Error(t, err)

	customer := sampleCustomer()
	customer.ID = 9
	db.ExpectQuery("UPDATE customer SET").WithArgs(customer.NamaCustomer, customer.NoTelp, customer.Alamat, customer.Email, customer.TanggalLahir, customer.JenisKelamin, customer.ID).WillReturnError(errors.New("update failed"))
	require.Error(t, repo.Update(context.Background(), customer))

	db.ExpectExec("DELETE FROM customer").WithArgs(9).WillReturnError(errors.New("delete failed"))
	require.Error(t, repo.Delete(context.Background(), 9))
	require.NoError(t, db.ExpectationsWereMet())
}
