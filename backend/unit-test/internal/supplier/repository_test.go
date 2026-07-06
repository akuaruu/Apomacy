package unittest

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/akuaruu/apomacy/backend/internal/repository"
	"github.com/jackc/pgx/v5"
	"github.com/pashagolub/pgxmock/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func supplierFixture() *model.Supplier {
	email := "supplier@example.com"
	cp := "Budi"
	return &model.Supplier{ID: 1, KodeSupplier: "SUP-1", NamaSupplier: "Medika", Alamat: "Jl. Sehat", Kota: "Bandung", NoTelp: "0812", Email: &email, ContactPerson: &cp, StatusKemitraan: model.KemitraanActive}
}

func TestSupplierRepositoryCRUD(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewSupplierRepository(db)
	supplier := supplierFixture()
	now := time.Now()

	db.ExpectQuery("INSERT INTO supplier").WithArgs(supplier.KodeSupplier, supplier.NamaSupplier, supplier.Alamat, supplier.Kota, supplier.NoTelp, supplier.Email, supplier.ContactPerson, supplier.StatusKemitraan, pgxmock.AnyArg()).WillReturnRows(pgxmock.NewRows([]string{"id_supplier"}).AddRow(1))
	require.NoError(t, repo.Create(context.Background(), supplier))
	assert.False(t, supplier.CreatedAt.IsZero())

	columns := []string{"id_supplier", "kode_supplier", "nama_supplier", "alamat", "kota", "no_telp", "email", "contact_person", "status_kemitraan", "created_at"}
	row := []any{1, supplier.KodeSupplier, supplier.NamaSupplier, supplier.Alamat, supplier.Kota, supplier.NoTelp, supplier.Email, supplier.ContactPerson, supplier.StatusKemitraan, now}
	db.ExpectQuery("SELECT id_supplier.*WHERE id_supplier").WithArgs(1).WillReturnRows(pgxmock.NewRows(columns).AddRow(row...))
	result, err := repo.GetByID(context.Background(), 1)
	require.NoError(t, err)
	assert.Equal(t, supplier.KodeSupplier, result.KodeSupplier)

	db.ExpectQuery("SELECT id_supplier.*ORDER BY id_supplier DESC").WillReturnRows(pgxmock.NewRows(columns).AddRow(row...))
	list, err := repo.GetAll(context.Background())
	require.NoError(t, err)
	require.Len(t, list, 1)

	db.ExpectExec("UPDATE supplier").WithArgs(supplier.KodeSupplier, supplier.NamaSupplier, supplier.Alamat, supplier.Kota, supplier.NoTelp, supplier.Email, supplier.ContactPerson, supplier.StatusKemitraan, supplier.ID).WillReturnResult(pgxmock.NewResult("UPDATE", 1))
	require.NoError(t, repo.Update(context.Background(), supplier))

	db.ExpectExec("DELETE FROM supplier").WithArgs(1).WillReturnResult(pgxmock.NewResult("DELETE", 1))
	require.NoError(t, repo.Delete(context.Background(), 1))
	require.NoError(t, db.ExpectationsWereMet())
}

func TestSupplierRepositoryFailuresAndEmptyResult(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewSupplierRepository(db)
	supplier := supplierFixture()

	db.ExpectQuery("INSERT INTO supplier").WithArgs(supplier.KodeSupplier, supplier.NamaSupplier, supplier.Alamat, supplier.Kota, supplier.NoTelp, supplier.Email, supplier.ContactPerson, supplier.StatusKemitraan, pgxmock.AnyArg()).WillReturnError(errors.New("insert failed"))
	require.Error(t, repo.Create(context.Background(), supplier))

	db.ExpectQuery("SELECT id_supplier.*WHERE id_supplier").WithArgs(404).WillReturnError(pgx.ErrNoRows)
	result, err := repo.GetByID(context.Background(), 404)
	require.EqualError(t, err, "supplier tidak ditemukan")
	assert.Nil(t, result)

	columns := []string{"id_supplier", "kode_supplier", "nama_supplier", "alamat", "kota", "no_telp", "email", "contact_person", "status_kemitraan", "created_at"}
	db.ExpectQuery("SELECT id_supplier.*ORDER BY id_supplier DESC").WillReturnRows(pgxmock.NewRows(columns))
	list, err := repo.GetAll(context.Background())
	require.NoError(t, err)
	assert.NotNil(t, list)
	assert.Empty(t, list)

	db.ExpectExec("UPDATE supplier").WithArgs(supplier.KodeSupplier, supplier.NamaSupplier, supplier.Alamat, supplier.Kota, supplier.NoTelp, supplier.Email, supplier.ContactPerson, supplier.StatusKemitraan, supplier.ID).WillReturnError(errors.New("update failed"))
	require.Error(t, repo.Update(context.Background(), supplier))

	db.ExpectExec("DELETE FROM supplier").WithArgs(9).WillReturnResult(pgxmock.NewResult("DELETE", 0))
	require.EqualError(t, repo.Delete(context.Background(), 9), "supplier tidak ditemukan")

	db.ExpectExec("DELETE FROM supplier").WithArgs(10).WillReturnError(errors.New("delete failed"))
	require.Error(t, repo.Delete(context.Background(), 10))
	require.NoError(t, db.ExpectationsWereMet())
}
