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

func obatFixture() *model.Obat {
	image := "https://example.com/obat.png"
	return &model.Obat{ID: 1, IDSupplier: 2, KodeObat: "OBT-1", NamaObat: "Paracetamol", JenisObat: "Obat Bebas", BentukObat: "Tablet", Satuan: "Strip", HargaBeli: 5000, HargaJual: 7000, Stok: 10, StokMinimum: 2, ExpiredDate: time.Date(2028, 1, 1, 0, 0, 0, 0, time.UTC), GambarProduk: &image, DosisPemakaian: "3x1", Komposisi: "Paracetamol", Deskripsi: "Penurun panas"}
}

func expectObatInsert(db pgxmock.PgxPoolIface, obat *model.Obat, rows *pgxmock.Rows) {
	db.ExpectQuery("INSERT INTO obat").WithArgs(obat.IDSupplier, obat.KodeObat, obat.NamaObat, obat.JenisObat, obat.BentukObat, obat.Satuan, obat.HargaBeli, obat.HargaJual, obat.Stok, obat.StokMinimum, obat.ExpiredDate, obat.GambarProduk, obat.DosisPemakaian, obat.Komposisi, obat.Deskripsi).WillReturnRows(rows)
}

func TestObatRepositoryCreateAndCategorySync(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewObatRepository(db)
	obat := obatFixture()
	obat.Kategori = []string{"Demam", "Nyeri"}
	now := time.Now()
	expectObatInsert(db, obat, pgxmock.NewRows([]string{"id_obat", "created_at", "updated_at"}).AddRow(1, now, now))
	db.ExpectExec("DELETE FROM obat_kategori").WithArgs(1).WillReturnResult(pgxmock.NewResult("DELETE", 0))
	db.ExpectQuery("SELECT id_kategori FROM kategori").WithArgs("Demam").WillReturnRows(pgxmock.NewRows([]string{"id_kategori"}).AddRow(5))
	db.ExpectExec("INSERT INTO obat_kategori").WithArgs(1, 5).WillReturnResult(pgxmock.NewResult("INSERT", 1))
	db.ExpectQuery("SELECT id_kategori FROM kategori").WithArgs("Nyeri").WillReturnError(pgx.ErrNoRows)
	db.ExpectQuery("INSERT INTO kategori").WithArgs("Nyeri").WillReturnRows(pgxmock.NewRows([]string{"id_kategori"}).AddRow(6))
	db.ExpectExec("INSERT INTO obat_kategori").WithArgs(1, 6).WillReturnResult(pgxmock.NewResult("INSERT", 1))

	require.NoError(t, repo.Create(context.Background(), obat))
	assert.Equal(t, 1, obat.ID)
	require.NoError(t, db.ExpectationsWereMet())
}

func TestObatRepositoryRead(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewObatRepository(db)
	obat := obatFixture()
	now := time.Now()
	columns := []string{"id_obat", "id_supplier", "kode_obat", "nama_obat", "jenis_obat", "bentuk_obat", "satuan", "harga_beli", "harga_jual", "stok", "stok_minimum", "expired_date", "gambar_produk", "dosis_pemakaian", "komposisi", "deskripsi", "created_at", "updated_at", "kategori_gabungan"}
	row := []any{obat.ID, obat.IDSupplier, obat.KodeObat, obat.NamaObat, obat.JenisObat, obat.BentukObat, obat.Satuan, obat.HargaBeli, obat.HargaJual, obat.Stok, obat.StokMinimum, obat.ExpiredDate, obat.GambarProduk, obat.DosisPemakaian, obat.Komposisi, obat.Deskripsi, now, now, "Demam,Nyeri"}

	db.ExpectQuery("SELECT.*FROM obat o.*WHERE o.id_obat").WithArgs(1).WillReturnRows(pgxmock.NewRows(columns).AddRow(row...))
	result, err := repo.GetByID(context.Background(), 1)
	require.NoError(t, err)
	assert.Equal(t, []string{"Demam", "Nyeri"}, result.Kategori)

	db.ExpectQuery("SELECT.*FROM obat o.*ORDER BY o.nama_obat").WillReturnRows(pgxmock.NewRows(columns).AddRow(row...))
	list, err := repo.GetAll(context.Background())
	require.NoError(t, err)
	require.Len(t, list, 1)
	assert.Equal(t, []string{"Demam", "Nyeri"}, list[0].Kategori)
	require.NoError(t, db.ExpectationsWereMet())
}

func TestObatRepositoryUpdateDeleteAndFailures(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewObatRepository(db)
	obat := obatFixture()
	now := time.Now()

	db.ExpectQuery("UPDATE obat SET").WithArgs(obat.NamaObat, obat.JenisObat, obat.BentukObat, obat.Satuan, obat.IDSupplier, obat.HargaBeli, obat.HargaJual, obat.Stok, obat.StokMinimum, obat.ExpiredDate, obat.DosisPemakaian, obat.Komposisi, obat.Deskripsi, obat.GambarProduk, obat.ID).WillReturnRows(pgxmock.NewRows([]string{"updated_at"}).AddRow(now))
	db.ExpectExec("DELETE FROM obat_kategori").WithArgs(obat.ID).WillReturnResult(pgxmock.NewResult("DELETE", 0))
	require.NoError(t, repo.Update(context.Background(), obat))

	db.ExpectExec("DELETE FROM obat_kategori").WithArgs(1).WillReturnResult(pgxmock.NewResult("DELETE", 1))
	db.ExpectExec("DELETE FROM obat WHERE").WithArgs(1).WillReturnResult(pgxmock.NewResult("DELETE", 1))
	require.NoError(t, repo.Delete(context.Background(), 1))

	db.ExpectQuery("SELECT.*FROM obat o.*WHERE o.id_obat").WithArgs(404).WillReturnError(pgx.ErrNoRows)
	_, err = repo.GetByID(context.Background(), 404)
	require.Error(t, err)

	db.ExpectQuery("INSERT INTO obat").WithArgs(obat.IDSupplier, obat.KodeObat, obat.NamaObat, obat.JenisObat, obat.BentukObat, obat.Satuan, obat.HargaBeli, obat.HargaJual, obat.Stok, obat.StokMinimum, obat.ExpiredDate, obat.GambarProduk, obat.DosisPemakaian, obat.Komposisi, obat.Deskripsi).WillReturnError(errors.New("insert failed"))
	require.Error(t, repo.Create(context.Background(), obat))
	require.NoError(t, db.ExpectationsWereMet())
}
