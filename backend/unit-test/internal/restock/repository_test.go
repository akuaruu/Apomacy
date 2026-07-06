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

func sampleRestock() *model.Restock {
	expiry := time.Date(2028, 1, 1, 0, 0, 0, 0, time.UTC)
	return &model.Restock{IDSupplier: 1, IDUser: 2, NoFakturSupplier: "SUP-1", NoPenerimaanInternal: "RST-1", TanggalRestock: time.Now(), TotalBayar: 5000, Details: []model.DetailRestock{{IDObat: 3, HargaBeli: 1000, Jumlah: 5, TanggalKadaluarsa: expiry, Subtotal: 5000}}}
}

func TestRestockRepositoryCreateWithDetails(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewRestockRepository(db)
	restock := sampleRestock()
	detail := restock.Details[0]

	db.ExpectBegin()
	db.ExpectQuery(`INSERT INTO restock`).WithArgs(restock.IDSupplier, restock.IDUser, restock.NoFakturSupplier, restock.NoPenerimaanInternal, restock.TanggalRestock, restock.TotalBayar, restock.Keterangan).WillReturnRows(pgxmock.NewRows([]string{"id_restock"}).AddRow(10))
	db.ExpectExec(`INSERT INTO detail_restock`).WithArgs(10, detail.IDObat, detail.HargaBeli, detail.Jumlah, detail.TanggalKadaluarsa, detail.Subtotal).WillReturnResult(pgxmock.NewResult("INSERT", 1))
	db.ExpectExec(`UPDATE obat`).WithArgs(detail.Jumlah, detail.HargaBeli, detail.TanggalKadaluarsa, detail.IDObat).WillReturnResult(pgxmock.NewResult("UPDATE", 1))
	db.ExpectCommit()
	require.NoError(t, repo.CreateWithDetails(context.Background(), restock))
	assert.Equal(t, 10, restock.ID)
	require.NoError(t, db.ExpectationsWereMet())
}

func TestRestockRepositoryRollsBackFailures(t *testing.T) {
	backendError := errors.New("database failed")
	t.Run("begin", func(t *testing.T) {
		db, _ := pgxmock.NewPool()
		defer db.Close()
		db.ExpectBegin().WillReturnError(backendError)
		err := repository.NewRestockRepository(db).CreateWithDetails(context.Background(), sampleRestock())
		require.Error(t, err)
		require.NoError(t, db.ExpectationsWereMet())
	})
	t.Run("header", func(t *testing.T) {
		db, _ := pgxmock.NewPool()
		defer db.Close()
		restock := sampleRestock()
		db.ExpectBegin()
		db.ExpectQuery(`INSERT INTO restock`).WithArgs(restock.IDSupplier, restock.IDUser, restock.NoFakturSupplier, restock.NoPenerimaanInternal, restock.TanggalRestock, restock.TotalBayar, restock.Keterangan).WillReturnError(backendError)
		db.ExpectRollback()
		err := repository.NewRestockRepository(db).CreateWithDetails(context.Background(), restock)
		require.Error(t, err)
		require.NoError(t, db.ExpectationsWereMet())
	})
	t.Run("detail", func(t *testing.T) {
		db, _ := pgxmock.NewPool()
		defer db.Close()
		restock := sampleRestock()
		detail := restock.Details[0]
		db.ExpectBegin()
		db.ExpectQuery(`INSERT INTO restock`).WithArgs(restock.IDSupplier, restock.IDUser, restock.NoFakturSupplier, restock.NoPenerimaanInternal, restock.TanggalRestock, restock.TotalBayar, restock.Keterangan).WillReturnRows(pgxmock.NewRows([]string{"id_restock"}).AddRow(10))
		db.ExpectExec(`INSERT INTO detail_restock`).WithArgs(10, detail.IDObat, detail.HargaBeli, detail.Jumlah, detail.TanggalKadaluarsa, detail.Subtotal).WillReturnError(backendError)
		db.ExpectRollback()
		err := repository.NewRestockRepository(db).CreateWithDetails(context.Background(), restock)
		require.Error(t, err)
		require.NoError(t, db.ExpectationsWereMet())
	})
}

func TestRestockRepositoryGetByIDDocumentsUnsupportedOperation(t *testing.T) {
	db, _ := pgxmock.NewPool()
	defer db.Close()
	result, err := repository.NewRestockRepository(db).GetByID(context.Background(), 1)
	assert.Nil(t, result)
	require.EqualError(t, err, "belum diimplementasikan")
}
