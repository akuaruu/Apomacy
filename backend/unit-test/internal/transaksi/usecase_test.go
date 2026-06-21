package unittest

import (
	"context"
	"errors"
	"testing"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/akuaruu/apomacy/backend/internal/usecase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// --- MOCK REPOSITORY ---
type MockTransaksiRepository struct {
	mock.Mock
}

func (m *MockTransaksiRepository) CreateWithDetails(ctx context.Context, tx *model.Transaksi) error {
	args := m.Called(ctx, tx)
	return args.Error(0)
}
func (m *MockTransaksiRepository) GetByID(ctx context.Context, id int) (*model.Transaksi, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*model.Transaksi), args.Error(1)
	}
	return nil, args.Error(1)
}
func (m *MockTransaksiRepository) UpdateStatus(ctx context.Context, id int, status model.StatusTransaksi) error {
	args := m.Called(ctx, id, status)
	return args.Error(0)
}
func (m *MockTransaksiRepository) UpdateStatusByNoTransaksi(ctx context.Context, noTransaksi string, status model.StatusTransaksi) error {
	args := m.Called(ctx, noTransaksi, status)
	return args.Error(0)
}
func (m *MockTransaksiRepository) GetByUserID(ctx context.Context, idUser int) ([]*model.Transaksi, error) {
	args := m.Called(ctx, idUser)
	if args.Get(0) != nil {
		return args.Get(0).([]*model.Transaksi), args.Error(1)
	}
	return nil, args.Error(1)
}
func (m *MockTransaksiRepository) GetAll(ctx context.Context) ([]model.Transaksi, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).([]model.Transaksi), args.Error(1)
	}
	return nil, args.Error(1)
}
func (m *MockTransaksiRepository) UpdateStatusPesanan(ctx context.Context, noTransaksi string, statusPesanan string) error {
	args := m.Called(ctx, noTransaksi, statusPesanan)
	return args.Error(0)
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

func TestUsecase_Checkout_Success(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	tx := &model.Transaksi{
		Subtotal:   50000,
		TotalBayar: 50000,
		Details:    []model.DetailTransaksi{{IDObat: 1, Qty: 1}},
	}

	mockRepo.On("CreateWithDetails", mock.Anything, tx).Return(nil)

	err := uc.Checkout(context.Background(), tx)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestUsecase_Checkout_Gagal_KeranjangKosong(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	tx := &model.Transaksi{Details: []model.DetailTransaksi{}}

	err := uc.Checkout(context.Background(), tx)

	require.Error(t, err)
	assert.Equal(t, "keranjang belanja tidak boleh kosong", err.Error())
}

func TestUsecase_Checkout_Gagal_BayarKurang(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	tx := &model.Transaksi{
		Subtotal:   50000,
		TotalBayar: 40000,
		Details:    []model.DetailTransaksi{{IDObat: 1, Qty: 1}},
	}

	err := uc.Checkout(context.Background(), tx)

	require.Error(t, err)
	assert.Equal(t, "total bayar tidak mencukupi", err.Error())
}

func TestUsecase_Checkout_Gagal_DeliveryTanpaAlamat(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	alamatKosong := ""
	tx := &model.Transaksi{
		Subtotal:   50000,
		TotalBayar: 50000,
		Details:    []model.DetailTransaksi{{IDObat: 1, Qty: 1}},
		Pengiriman: &model.Pengiriman{MetodePenerimaan: "delivery", AlamatPengiriman: &alamatKosong},
	}

	err := uc.Checkout(context.Background(), tx)

	require.Error(t, err)
	assert.Equal(t, "alamat pengiriman wajib diisi untuk metode delivery", err.Error())
}

func TestUsecase_Checkout_Gagal_PickupTanpaNama(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	namaKosong := ""
	tx := &model.Transaksi{
		Subtotal:   50000,
		TotalBayar: 50000,
		Details:    []model.DetailTransaksi{{IDObat: 1, Qty: 1}},
		Pengiriman: &model.Pengiriman{MetodePenerimaan: "pickup", NamaPenerima: &namaKosong},
	}

	err := uc.Checkout(context.Background(), tx)

	require.Error(t, err)
	assert.Equal(t, "nama pengambil wajib diisi untuk metode pickup", err.Error())
}

// ---------------------------------------------------------------------------
// GetDetailTransaksi
// ---------------------------------------------------------------------------

func TestUsecase_GetDetailTransaksi_Success_Pemilik(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockTrx := &model.Transaksi{ID: 1, IDUser: 5}
	mockRepo.On("GetByID", mock.Anything, 1).Return(mockTrx, nil)

	trx, err := uc.GetDetailTransaksi(context.Background(), 5, false, 1)

	assert.NoError(t, err)
	assert.Equal(t, 5, trx.IDUser)
	mockRepo.AssertExpectations(t)
}

func TestUsecase_GetDetailTransaksi_Success_Staff(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockTrx := &model.Transaksi{ID: 1, IDUser: 10}
	mockRepo.On("GetByID", mock.Anything, 1).Return(mockTrx, nil)

	trx, err := uc.GetDetailTransaksi(context.Background(), 99, true, 1)

	assert.NoError(t, err)
	assert.NotNil(t, trx)
}

func TestUsecase_GetDetailTransaksi_Gagal_AksesDitolak(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockTrx := &model.Transaksi{ID: 1, IDUser: 10}
	mockRepo.On("GetByID", mock.Anything, 1).Return(mockTrx, nil)

	trx, err := uc.GetDetailTransaksi(context.Background(), 5, false, 1)

	require.Error(t, err)
	assert.Nil(t, trx)
	assert.Equal(t, "akses ditolak: transaksi ini bukan milik anda", err.Error())
}

// ---------------------------------------------------------------------------
// BatalkanTransaksi & UpdateStatus
// ---------------------------------------------------------------------------

func TestUsecase_BatalkanTransaksi_Success(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockRepo.On("UpdateStatus", mock.Anything, 1, model.TxBatal).Return(nil)

	err := uc.BatalkanTransaksi(context.Background(), 1)
	assert.NoError(t, err)
}

func TestUsecase_UpdateStatusPesanan_Success(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockRepo.On("UpdateStatusPesanan", mock.Anything, "TRX-01", "Sedang Dikirim").Return(nil)

	err := uc.UpdateStatusPesanan(context.Background(), "TRX-01", "Sedang Dikirim")
	assert.NoError(t, err)
}

func TestUsecase_UpdateStatusPesanan_Gagal_StatusTidakValid(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	err := uc.UpdateStatusPesanan(context.Background(), "TRX-01", "Status Ngawur")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "status pesanan tidak valid")
}

func TestUsecase_GetDetailTransaksi_Gagal_GetByIDError(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockRepo.On("GetByID", mock.Anything, 1).Return(nil, errors.New("database down"))

	trx, err := uc.GetDetailTransaksi(context.Background(), 5, false, 1)

	require.Error(t, err)
	assert.Nil(t, trx)
	assert.Equal(t, "database down", err.Error())
}

func TestUsecase_UpdateStatusByNoTransaksi_Success(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockRepo.On("UpdateStatusByNoTransaksi", mock.Anything, "TRX-99", model.TxSelesai).Return(nil)

	err := uc.UpdateStatusByNoTransaksi(context.Background(), "TRX-99", model.TxSelesai)
	assert.NoError(t, err)
}

func TestUsecase_GetRiwayatByUser_Success(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockData := []*model.Transaksi{{ID: 1}, {ID: 2}}
	mockRepo.On("GetByUserID", mock.Anything, 5).Return(mockData, nil)

	res, err := uc.GetRiwayatByUser(context.Background(), 5)

	assert.NoError(t, err)
	assert.Len(t, res, 2)
}

func TestUsecase_GetAll_Success(t *testing.T) {
	mockRepo := new(MockTransaksiRepository)
	uc := usecase.NewTransaksiUsecase(mockRepo)

	mockData := []model.Transaksi{{ID: 1}, {ID: 2}}
	mockRepo.On("GetAll", mock.Anything).Return(mockData, nil)

	res, err := uc.GetAll(context.Background())

	assert.NoError(t, err)
	assert.Len(t, res, 2)
}
