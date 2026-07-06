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

// ---------------------------------------------------------------------------
// CreateWithDetails
// ---------------------------------------------------------------------------

func TestCreateWithDetails_Success_TanpaPengiriman(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	tx := &model.Transaksi{
		IDUser:           1,
		NoTransaksi:      "TRX-001",
		Subtotal:         50000,
		TotalBayar:       50000,
		MetodePembayaran: model.MetodeQRIS,
		Details: []model.DetailTransaksi{
			{IDObat: 10, NamaObat: "Paracetamol", HargaSatuan: 5000, Qty: 2, Subtotal: 10000},
		},
	}

	mock.ExpectBegin()

	mock.ExpectQuery("INSERT INTO transaksi").
		WithArgs(
			tx.IDCustomer, tx.IDUser, tx.NoTransaksi, pgxmock.AnyArg(), tx.NamaCustomer,
			tx.TotalItem, tx.Subtotal, tx.TotalBayar, tx.MetodePembayaran,
			tx.ResepRequired, tx.NoResep, model.TxPending, "Menunggu Pembayaran",
		).
		WillReturnRows(pgxmock.NewRows([]string{"id_transaksi"}).AddRow(1))

	mock.ExpectExec("INSERT INTO detail_transaksi").
		WithArgs(1, 10, "Paracetamol", 5000.0, 2, 10000.0).
		WillReturnResult(pgxmock.NewResult("INSERT", 1))

	mock.ExpectExec("UPDATE obat SET stok").
		WithArgs(2, 10).
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	mock.ExpectCommit()

	err = repo.CreateWithDetails(context.Background(), tx)

	assert.NoError(t, err)
	assert.Equal(t, 1, tx.ID)
	assert.Equal(t, model.TxPending, tx.Status)
	assert.Equal(t, "Menunggu Pembayaran", tx.StatusPesanan)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCreateWithDetails_Success_DenganPengiriman(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	alamat := "Jl. Merdeka No. 1"
	nama := "Budi"
	noHp := "08123456789"

	tx := &model.Transaksi{
		IDUser:           2,
		NoTransaksi:      "TRX-002",
		Subtotal:         20000,
		TotalBayar:       20000,
		MetodePembayaran: model.MetodeTransfer,
		Details: []model.DetailTransaksi{
			{IDObat: 11, NamaObat: "Vitamin C", HargaSatuan: 20000, Qty: 1, Subtotal: 20000},
		},
		Pengiriman: &model.Pengiriman{
			MetodePenerimaan: "delivery",
			NamaPenerima:     &nama,
			NoHpPenerima:     &noHp,
			AlamatPengiriman: &alamat,
		},
	}

	mock.ExpectBegin()

	mock.ExpectQuery("INSERT INTO transaksi").
		WithArgs(
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
		).
		WillReturnRows(pgxmock.NewRows([]string{"id_transaksi"}).AddRow(5))

	mock.ExpectExec("INSERT INTO detail_transaksi").
		WithArgs(5, 11, "Vitamin C", 20000.0, 1, 20000.0).
		WillReturnResult(pgxmock.NewResult("INSERT", 1))

	mock.ExpectExec("UPDATE obat SET stok").
		WithArgs(1, 11).
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	mock.ExpectQuery("INSERT INTO transaksi_pengiriman").
		WithArgs(5, "delivery", &nama, &noHp, &alamat).
		WillReturnRows(pgxmock.NewRows([]string{"id_pengiriman"}).AddRow(99))

	mock.ExpectCommit()

	err = repo.CreateWithDetails(context.Background(), tx)

	assert.NoError(t, err)
	assert.Equal(t, 5, tx.ID)
	require.NotNil(t, tx.Pengiriman)
	assert.Equal(t, 99, tx.Pengiriman.IDPengiriman)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCreateWithDetails_StokTidakCukup_Rollback(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	tx := &model.Transaksi{
		IDUser:      3,
		NoTransaksi: "TRX-003",
		Details: []model.DetailTransaksi{
			{IDObat: 12, NamaObat: "Antasida", HargaSatuan: 8000, Qty: 100, Subtotal: 800000},
		},
	}

	mock.ExpectBegin()

	mock.ExpectQuery("INSERT INTO transaksi").
		WithArgs(
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
		).
		WillReturnRows(pgxmock.NewRows([]string{"id_transaksi"}).AddRow(7))

	mock.ExpectExec("INSERT INTO detail_transaksi").
		WithArgs(
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
		).
		WillReturnResult(pgxmock.NewResult("INSERT", 1))

	// Stok tidak mencukupi: RowsAffected = 0
	mock.ExpectExec("UPDATE obat SET stok").
		WithArgs(100, 12).
		WillReturnResult(pgxmock.NewResult("UPDATE", 0))

	mock.ExpectRollback()

	err = repo.CreateWithDetails(context.Background(), tx)

	require.Error(t, err)
	assert.Contains(t, err.Error(), "stok obat tidak mencukupi")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCreateWithDetails_GagalInsertTransaksi_Rollback(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	tx := &model.Transaksi{
		IDUser:      4,
		NoTransaksi: "TRX-004",
		Details: []model.DetailTransaksi{
			{IDObat: 13, NamaObat: "Amoxicillin", HargaSatuan: 12000, Qty: 1, Subtotal: 12000},
		},
	}

	mock.ExpectBegin()

	mock.ExpectQuery("INSERT INTO transaksi").
		WithArgs(
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
		).
		WillReturnError(errors.New("duplicate key value violates unique constraint"))

	mock.ExpectRollback()

	err = repo.CreateWithDetails(context.Background(), tx)

	require.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------------------------------------------------------------------------
// GetByID
// ---------------------------------------------------------------------------

func TestGetByID_Success_DenganPengiriman(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	tanggal := time.Now()
	alamat := "Jl. Sudirman No. 5"
	metode := "delivery"
	idPengirimanRow := 50

	rows := pgxmock.NewRows([]string{
		"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi", "nama_customer",
		"total_item", "subtotal", "total_bayar", "metode_pembayaran", "resep_required", "no_resep",
		"status", "status_pesanan",
		"id_pengiriman", "metode_penerimaan", "nama_penerima", "no_hp_penerima", "alamat_pengiriman", "waktu_pesanan_sampai",
	}).AddRow(
		1, nil, 1, "TRX-001", tanggal, nil,
		1, 10000.0, 10000.0, model.MetodeQRIS, false, nil,
		model.TxPending, "Menunggu Pembayaran",
		&idPengirimanRow, &metode, nil, nil, &alamat, nil,
	)

	mock.ExpectQuery("SELECT(.|\n)*FROM transaksi t(.|\n)*LEFT JOIN transaksi_pengiriman").
		WithArgs(1).
		WillReturnRows(rows)

	detailRows := pgxmock.NewRows([]string{
		"id_detail_trx", "id_transaksi", "id_obat", "nama_obat", "harga_satuan", "qty", "subtotal",
	}).AddRow(1, 1, 10, "Paracetamol", 5000.0, 2, 10000.0)

	mock.ExpectQuery("SELECT(.|\n)*FROM detail_transaksi").
		WithArgs(1).
		WillReturnRows(detailRows)

	result, err := repo.GetByID(context.Background(), 1)

	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, 1, result.ID)
	assert.Equal(t, "TRX-001", result.NoTransaksi)
	require.Len(t, result.Details, 1)
	assert.Equal(t, "Paracetamol", result.Details[0].NamaObat)
	require.NotNil(t, result.Pengiriman)
	assert.Equal(t, "delivery", result.Pengiriman.MetodePenerimaan)
	assert.Equal(t, alamat, *result.Pengiriman.AlamatPengiriman)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetByID_Success_TanpaPengiriman(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	tanggal := time.Now()

	rows := pgxmock.NewRows([]string{
		"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi", "nama_customer",
		"total_item", "subtotal", "total_bayar", "metode_pembayaran", "resep_required", "no_resep",
		"status", "status_pesanan",
		"id_pengiriman", "metode_penerimaan", "nama_penerima", "no_hp_penerima", "alamat_pengiriman", "waktu_pesanan_sampai",
	}).AddRow(
		2, nil, 1, "TRX-002", tanggal, nil,
		1, 10000.0, 10000.0, model.MetodeTunai, false, nil,
		model.TxSelesai, "Selesai",
		nil, nil, nil, nil, nil, nil,
	)

	mock.ExpectQuery("SELECT(.|\n)*FROM transaksi t(.|\n)*LEFT JOIN transaksi_pengiriman").
		WithArgs(2).
		WillReturnRows(rows)

	mock.ExpectQuery("SELECT(.|\n)*FROM detail_transaksi").
		WithArgs(2).
		WillReturnRows(pgxmock.NewRows([]string{
			"id_detail_trx", "id_transaksi", "id_obat", "nama_obat", "harga_satuan", "qty", "subtotal",
		}))

	result, err := repo.GetByID(context.Background(), 2)

	require.NoError(t, err)
	assert.Nil(t, result.Pengiriman)
	assert.Empty(t, result.Details)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetByID_TidakDitemukan(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	mock.ExpectQuery("SELECT(.|\n)*FROM transaksi t(.|\n)*LEFT JOIN transaksi_pengiriman").
		WithArgs(999).
		WillReturnError(pgx.ErrNoRows)

	result, err := repo.GetByID(context.Background(), 999)

	require.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, "transaksi tidak ditemukan", err.Error())
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------------------------------------------------------------------------
// UpdateStatus
// ---------------------------------------------------------------------------

func TestUpdateStatus_Success(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	mock.ExpectExec("UPDATE transaksi SET status").
		WithArgs(model.TxBatal, 1).
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	err = repo.UpdateStatus(context.Background(), 1, model.TxBatal)

	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------------------------------------------------------------------------
// UpdateStatusByNoTransaksi
// ---------------------------------------------------------------------------

func TestUpdateStatusByNoTransaksi_Selesai(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	mock.ExpectExec("UPDATE transaksi SET status(.|\n)*status_pesanan = 'Menunggu Diproses'").
		WithArgs(model.TxSelesai, "TRX-001").
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	err = repo.UpdateStatusByNoTransaksi(context.Background(), "TRX-001", model.TxSelesai)

	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateStatusByNoTransaksi_Batal(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	mock.ExpectExec("UPDATE transaksi SET status(.|\n)*status_pesanan = 'Dibatalkan'").
		WithArgs(model.TxBatal, "TRX-002").
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	err = repo.UpdateStatusByNoTransaksi(context.Background(), "TRX-002", model.TxBatal)

	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateStatusByNoTransaksi_TidakDitemukan(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	mock.ExpectExec("UPDATE transaksi SET status").
		WithArgs(model.TxPending, "TRX-TIDAK-ADA").
		WillReturnResult(pgxmock.NewResult("UPDATE", 0))

	err = repo.UpdateStatusByNoTransaksi(context.Background(), "TRX-TIDAK-ADA", model.TxPending)

	require.Error(t, err)
	assert.Contains(t, err.Error(), "transaksi tidak ditemukan")
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------------------------------------------------------------------------
// GetByUserID
// ---------------------------------------------------------------------------

func TestGetByUserID_Success(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	tanggal := time.Now()

	rows := pgxmock.NewRows([]string{
		"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi",
		"nama_customer", "total_item", "subtotal", "total_bayar", "metode_pembayaran",
		"resep_required", "no_resep", "status", "status_pesanan",
	}).
		AddRow(1, nil, 9, "TRX-100", tanggal, nil, 1, 10000.0, 10000.0, model.MetodeQRIS, false, nil, model.TxSelesai, "Selesai").
		AddRow(2, nil, 9, "TRX-101", tanggal, nil, 2, 20000.0, 20000.0, model.MetodeTunai, false, nil, model.TxPending, "Menunggu Pembayaran")

	mock.ExpectQuery("SELECT(.|\n)*FROM transaksi(.|\n)*WHERE id_user").
		WithArgs(9).
		WillReturnRows(rows)

	result, err := repo.GetByUserID(context.Background(), 9)

	require.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, "TRX-100", result[0].NoTransaksi)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetByUserID_Kosong(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	mock.ExpectQuery("SELECT(.|\n)*FROM transaksi(.|\n)*WHERE id_user").
		WithArgs(99).
		WillReturnRows(pgxmock.NewRows([]string{
			"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi",
			"nama_customer", "total_item", "subtotal", "total_bayar", "metode_pembayaran",
			"resep_required", "no_resep", "status", "status_pesanan",
		}))

	result, err := repo.GetByUserID(context.Background(), 99)

	require.NoError(t, err)
	assert.Empty(t, result)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------------------------------------------------------------------------
// GetAll
// ---------------------------------------------------------------------------

func TestGetAll_Success_DenganDetailDanPengiriman(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	tanggal := time.Now()
	alamat := "Jl. Diponegoro No. 9"
	metode := "delivery"

	trxRows := pgxmock.NewRows([]string{
		"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi",
		"nama_customer", "total_item", "subtotal", "total_bayar", "metode_pembayaran",
		"resep_required", "no_resep", "status", "status_pesanan",
	}).
		AddRow(1, nil, 1, "TRX-001", tanggal, nil, 1, 10000.0, 10000.0, model.MetodeQRIS, false, nil, model.TxPending, "Menunggu Pembayaran").
		AddRow(2, nil, 2, "TRX-002", tanggal, nil, 1, 20000.0, 20000.0, model.MetodeTunai, false, nil, model.TxSelesai, "Selesai")

	mock.ExpectQuery("SELECT(.|\n)*FROM transaksi(.|\n)*ORDER BY tanggal_transaksi").
		WillReturnRows(trxRows)

	detailRows := pgxmock.NewRows([]string{
		"id_detail_trx", "id_transaksi", "id_obat", "nama_obat", "harga_satuan", "qty", "subtotal",
	}).
		AddRow(1, 1, 10, "Paracetamol", 5000.0, 2, 10000.0).
		AddRow(2, 2, 11, "Vitamin C", 20000.0, 1, 20000.0)

	mock.ExpectQuery("SELECT(.|\n)*FROM detail_transaksi(.|\n)*ANY").
		WithArgs([]int{1, 2}).
		WillReturnRows(detailRows)

	pengirimanRows := pgxmock.NewRows([]string{
		"id_pengiriman", "id_transaksi", "metode_penerimaan", "nama_penerima",
		"no_hp_penerima", "alamat_pengiriman", "waktu_pesanan_sampai",
	}).
		AddRow(50, 1, "delivery", nil, nil, &alamat, nil)

	mock.ExpectQuery("SELECT(.|\n)*FROM transaksi_pengiriman(.|\n)*ANY").
		WithArgs([]int{1, 2}).
		WillReturnRows(pengirimanRows)

	result, err := repo.GetAll(context.Background())

	require.NoError(t, err)
	require.Len(t, result, 2)

	assert.Len(t, result[0].Details, 1)
	require.NotNil(t, result[0].Pengiriman)
	assert.Equal(t, "delivery", result[0].Pengiriman.MetodePenerimaan)
	assert.Equal(t, metode, result[0].Pengiriman.MetodePenerimaan)

	assert.Len(t, result[1].Details, 1)
	assert.Nil(t, result[1].Pengiriman)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetAll_Kosong(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	mock.ExpectQuery("SELECT(.|\n)*FROM transaksi(.|\n)*ORDER BY tanggal_transaksi").
		WillReturnRows(pgxmock.NewRows([]string{
			"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi",
			"nama_customer", "total_item", "subtotal", "total_bayar", "metode_pembayaran",
			"resep_required", "no_resep", "status", "status_pesanan",
		}))

	result, err := repo.GetAll(context.Background())

	require.NoError(t, err)
	assert.Empty(t, result)
	// Tidak ada query detail/pengiriman karena tidak ada transaksi
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------------------------------------------------------------------------
// UpdateStatusPesanan
// ---------------------------------------------------------------------------

func TestUpdateStatusPesanan_Success(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	mock.ExpectExec("UPDATE transaksi SET status_pesanan").
		WithArgs("Sedang Dikirim", "TRX-001").
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	err = repo.UpdateStatusPesanan(context.Background(), "TRX-001", "Sedang Dikirim")

	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ---------------------------------------------------------------------------
// SISA COVERAGE REPOSITORY (DATABASE ERRORS)
// ---------------------------------------------------------------------------

func TestCreateWithDetails_GagalInsertDetail(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)
	tx := &model.Transaksi{
		IDUser: 1, NoTransaksi: "TRX-ERR-1",
		Details: []model.DetailTransaksi{{IDObat: 10, Qty: 2}},
	}

	mock.ExpectBegin()

	// PERBAIKAN: Tambahkan WithArgs dengan 13 AnyArg()
	mock.ExpectQuery("INSERT INTO transaksi").
		WithArgs(
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
		).
		WillReturnRows(pgxmock.NewRows([]string{"id_transaksi"}).AddRow(1))

	// Simulasi gagal saat insert detail
	mock.ExpectExec("INSERT INTO detail_transaksi").
		WithArgs(1, 10, "", 0.0, 2, 0.0).
		WillReturnError(errors.New("db disconnect"))
	mock.ExpectRollback()

	err = repo.CreateWithDetails(context.Background(), tx)
	require.Error(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCreateWithDetails_GagalUpdateStokFatal(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)
	tx := &model.Transaksi{
		IDUser: 1, NoTransaksi: "TRX-ERR-2",
		Details: []model.DetailTransaksi{{IDObat: 10, Qty: 2}},
	}

	mock.ExpectBegin()

	// PERBAIKAN: Tambahkan WithArgs
	mock.ExpectQuery("INSERT INTO transaksi").
		WithArgs(
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
		).
		WillReturnRows(pgxmock.NewRows([]string{"id_transaksi"}).AddRow(1))

	mock.ExpectExec("INSERT INTO detail_transaksi").WillReturnResult(pgxmock.NewResult("INSERT", 1))

	// Simulasi error DB fatal saat update stok
	mock.ExpectExec("UPDATE obat SET stok").WillReturnError(errors.New("db disconnect"))
	mock.ExpectRollback()

	err = repo.CreateWithDetails(context.Background(), tx)
	require.Error(t, err)
}

func TestCreateWithDetails_GagalInsertPengiriman(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)
	metode := "delivery"
	tx := &model.Transaksi{
		IDUser: 1, NoTransaksi: "TRX-ERR-3",
		Details:    []model.DetailTransaksi{{IDObat: 10, Qty: 2}},
		Pengiriman: &model.Pengiriman{MetodePenerimaan: metode},
	}

	mock.ExpectBegin()

	// PERBAIKAN: Tambahkan WithArgs
	mock.ExpectQuery("INSERT INTO transaksi").
		WithArgs(
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
			pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(),
		).
		WillReturnRows(pgxmock.NewRows([]string{"id_transaksi"}).AddRow(1))

	mock.ExpectExec("INSERT INTO detail_transaksi").WillReturnResult(pgxmock.NewResult("INSERT", 1))
	mock.ExpectExec("UPDATE obat SET stok").WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	// Simulasi gagal insert pengiriman
	mock.ExpectQuery("INSERT INTO transaksi_pengiriman").WillReturnError(errors.New("db disconnect"))
	mock.ExpectRollback()

	err = repo.CreateWithDetails(context.Background(), tx)
	require.Error(t, err)
}

func TestGetByID_GagalDatabaseLain(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)

	// Mengembalikan error selain pgx.ErrNoRows
	mock.ExpectQuery("SELECT(.|\\n)*FROM transaksi t").WithArgs(1).WillReturnError(errors.New("fatal error"))

	_, err = repo.GetByID(context.Background(), 1)
	require.Error(t, err)
	assert.Equal(t, "fatal error", err.Error())
}

func TestGetByID_GagalQueryDetail(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)
	rows := pgxmock.NewRows([]string{"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi", "nama_customer", "total_item", "subtotal", "total_bayar", "metode_pembayaran", "resep_required", "no_resep", "status", "status_pesanan", "id_pengiriman", "metode_penerimaan", "nama_penerima", "no_hp_penerima", "alamat_pengiriman", "waktu_pesanan_sampai"}).
		AddRow(1, nil, 1, "TRX-01", time.Now(), nil, 1, 10000.0, 10000.0, "", false, nil, "", "", nil, nil, nil, nil, nil, nil)

	mock.ExpectQuery("SELECT(.|\\n)*FROM transaksi t").WithArgs(1).WillReturnRows(rows)
	mock.ExpectQuery("SELECT(.|\\n)*FROM detail_transaksi").WithArgs(1).WillReturnError(errors.New("db disconnect"))

	_, err = repo.GetByID(context.Background(), 1)
	require.Error(t, err)
}

func TestUpdateStatusByNoTransaksi_GagalDB(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)
	mock.ExpectExec("UPDATE transaksi SET status").WithArgs(model.TxSelesai, "TRX-01").WillReturnError(errors.New("db disconnect"))

	err = repo.UpdateStatusByNoTransaksi(context.Background(), "TRX-01", model.TxSelesai)
	require.Error(t, err)
}

func TestGetAll_GagalQueryTransaksi(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)
	mock.ExpectQuery("SELECT(.|\\n)*FROM transaksi").WillReturnError(errors.New("db disconnect"))

	_, err = repo.GetAll(context.Background())
	require.Error(t, err)
}

func TestGetAll_GagalQueryDetail(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)
	trxRows := pgxmock.NewRows([]string{"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi", "nama_customer", "total_item", "subtotal", "total_bayar", "metode_pembayaran", "resep_required", "no_resep", "status", "status_pesanan"}).
		AddRow(1, nil, 1, "TRX-01", time.Now(), nil, 1, 10000.0, 10000.0, "", false, nil, "", "")

	mock.ExpectQuery("SELECT(.|\\n)*FROM transaksi").WillReturnRows(trxRows)
	mock.ExpectQuery("SELECT(.|\\n)*FROM detail_transaksi").WillReturnError(errors.New("db disconnect"))

	_, err = repo.GetAll(context.Background())
	require.Error(t, err)
}

func TestGetAll_GagalQueryPengiriman(t *testing.T) {
	mock, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer mock.Close()

	repo := repository.NewTransaksiRepository(mock)
	trxRows := pgxmock.NewRows([]string{"id_transaksi", "id_customer", "id_user", "no_transaksi", "tanggal_transaksi", "nama_customer", "total_item", "subtotal", "total_bayar", "metode_pembayaran", "resep_required", "no_resep", "status", "status_pesanan"}).
		AddRow(1, nil, 1, "TRX-01", time.Now(), nil, 1, 10000.0, 10000.0, "", false, nil, "", "")

	mock.ExpectQuery("SELECT(.|\\n)*FROM transaksi").WillReturnRows(trxRows)
	mock.ExpectQuery("SELECT(.|\\n)*FROM detail_transaksi").WillReturnRows(pgxmock.NewRows([]string{"id_detail_trx", "id_transaksi", "id_obat", "nama_obat", "harga_satuan", "qty", "subtotal"}))
	mock.ExpectQuery("SELECT(.|\\n)*FROM transaksi_pengiriman").WillReturnError(errors.New("db disconnect"))

	_, err = repo.GetAll(context.Background())
	require.Error(t, err)
}
