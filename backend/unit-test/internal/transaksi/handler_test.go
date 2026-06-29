package unittest

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	delivery "github.com/akuaruu/apomacy/backend/internal/handler/http"
	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- MOCK USECASE ---
type MockTransaksiUsecase struct {
	mock.Mock
}

func (m *MockTransaksiUsecase) Checkout(ctx context.Context, tx *model.Transaksi) error {
	args := m.Called(ctx, tx)
	return args.Error(0)
}
func (m *MockTransaksiUsecase) GetDetailTransaksi(ctx context.Context, idUser int, isStaff bool, id int) (*model.Transaksi, error) {
	args := m.Called(ctx, idUser, isStaff, id)
	if args.Get(0) != nil {
		return args.Get(0).(*model.Transaksi), args.Error(1)
	}
	return nil, args.Error(1)
}
func (m *MockTransaksiUsecase) BatalkanTransaksi(ctx context.Context, id int) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockTransaksiUsecase) UpdateStatusByNoTransaksi(ctx context.Context, noTransaksi string, status model.StatusTransaksi) error {
	args := m.Called(ctx, noTransaksi, status)
	return args.Error(0)
}
func (m *MockTransaksiUsecase) GetRiwayatByUser(ctx context.Context, idUser int) ([]*model.Transaksi, error) {
	args := m.Called(ctx, idUser)
	if args.Get(0) != nil {
		return args.Get(0).([]*model.Transaksi), args.Error(1)
	}
	return nil, args.Error(1)
}
func (m *MockTransaksiUsecase) GetAll(ctx context.Context) ([]model.Transaksi, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).([]model.Transaksi), args.Error(1)
	}
	return nil, args.Error(1)
}
func (m *MockTransaksiUsecase) UpdateStatusPesanan(ctx context.Context, noTransaksi string, statusPesanan string) error {
	args := m.Called(ctx, noTransaksi, statusPesanan)
	return args.Error(0)
}

func setupTestRouter(handler *delivery.TransaksiHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	return r
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

func TestHandler_Checkout_Success(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.POST("/checkout", func(c *gin.Context) {
		c.Set("id_user", float64(1))
		h.Checkout(c)
	})

	txBody := map[string]interface{}{
		"subtotal":    50000,
		"total_bayar": 50000,
		"details":     []map[string]interface{}{{"id_obat": 1, "qty": 1}},
	}
	body, _ := json.Marshal(txBody)

	mockUC.On("Checkout", mock.Anything, mock.AnythingOfType("*model.Transaksi")).Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/checkout", bytes.NewBuffer(body))
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
}

func TestHandler_Checkout_Gagal_SesiTidakValid(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.POST("/checkout", h.Checkout)

	txBody := map[string]interface{}{"subtotal": 50000}
	body, _ := json.Marshal(txBody)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/checkout", bytes.NewBuffer(body))
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// ---------------------------------------------------------------------------
// GetDetail
// ---------------------------------------------------------------------------

func TestHandler_GetDetail_Success(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/detail/:id", func(c *gin.Context) {
		c.Set("id_user", float64(5))
		c.Set("role", "member")
		h.GetDetail(c)
	})

	mockTrx := &model.Transaksi{ID: 1, IDUser: 5}
	mockUC.On("GetDetailTransaksi", mock.Anything, 5, false, 1).Return(mockTrx, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/detail/1", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestHandler_GetDetail_Gagal_AksesDitolak(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/detail/:id", func(c *gin.Context) {
		c.Set("id_user", float64(2))
		c.Set("role", "member")
		h.GetDetail(c)
	})

	errAkses := errors.New("akses ditolak: transaksi ini bukan milik anda")
	mockUC.On("GetDetailTransaksi", mock.Anything, 2, false, 1).Return(nil, errAkses)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/detail/1", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// ---------------------------------------------------------------------------
// UpdateStatusPesanan
// ---------------------------------------------------------------------------

func TestHandler_UpdateStatusPesanan_Success(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.PATCH("/status/:id", h.UpdateStatusPesanan)

	reqBody := map[string]interface{}{"status_pesanan": "Selesai"}
	body, _ := json.Marshal(reqBody)

	mockUC.On("UpdateStatusPesanan", mock.Anything, "TRX-001", "Selesai").Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PATCH", "/status/TRX-001", bytes.NewBuffer(body))
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestHandler_UpdateStatusPesanan_Gagal_InvalidJSON(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.PATCH("/status/:id", h.UpdateStatusPesanan)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PATCH", "/status/TRX-001", bytes.NewBuffer([]byte(`{bad json}`)))
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

// ---------------------------------------------------------------------------
// GetAll
// ---------------------------------------------------------------------------

func TestHandler_GetAll_Success(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/all", h.GetAll)

	mockList := []model.Transaksi{{ID: 1}, {ID: 2}}
	mockUC.On("GetAll", mock.Anything).Return(mockList, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/all", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// ---------------------------------------------------------------------------
// TAMBAHAN COVERAGE HANDLER
// ---------------------------------------------------------------------------

func TestHandler_Batalkan_Success(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.PUT("/batal/:id", h.Batalkan)

	mockUC.On("BatalkanTransaksi", mock.Anything, 1).Return(nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/batal/1", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestHandler_Batalkan_Gagal_IDBukanAngka(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.PUT("/batal/:id", h.Batalkan)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/batal/abc", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_Batalkan_Gagal_UsecaseError(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.PUT("/batal/:id", h.Batalkan)

	mockUC.On("BatalkanTransaksi", mock.Anything, 1).Return(errors.New("gagal batal"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/batal/1", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestHandler_GetRiwayatUser_Success(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/riwayat", func(c *gin.Context) {
		c.Set("id_user", float64(5))
		h.GetRiwayatUser(c)
	})

	mockData := []*model.Transaksi{{ID: 1}}
	mockUC.On("GetRiwayatByUser", mock.Anything, 5).Return(mockData, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/riwayat", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestHandler_GetRiwayatUser_Gagal_SesiTidakValid(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/riwayat", h.GetRiwayatUser)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/riwayat", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestHandler_GetAll_Gagal_UsecaseError(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/all", h.GetAll)

	mockUC.On("GetAll", mock.Anything).Return(nil, errors.New("db error"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/all", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// ---------------------------------------------------------------------------
// SISA COVERAGE HANDLER (UNHAPPY PATH VALIDASI & SESI)
// ---------------------------------------------------------------------------

func TestHandler_Checkout_Gagal_InvalidJSON(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.POST("/checkout", h.Checkout)

	w := httptest.NewRecorder()
	// Mengirim body yang bukan JSON
	req, _ := http.NewRequest("POST", "/checkout", bytes.NewBuffer([]byte(`{bad_json}`)))
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_Checkout_Gagal_SesiInvalidType(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.POST("/checkout", func(c *gin.Context) {
		// Set sesi dengan tipe string (salah), seharusnya float64
		c.Set("id_user", "bukan_angka")
		h.Checkout(c)
	})

	txBody := map[string]interface{}{"subtotal": 50000}
	body, _ := json.Marshal(txBody)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/checkout", bytes.NewBuffer(body))
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	mockUC.AssertNotCalled(t, "Checkout", mock.Anything, mock.Anything)
}

func TestHandler_GetDetail_Gagal_IDBukanAngka(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/detail/:id", h.GetDetail)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/detail/abc", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_GetDetail_Gagal_SesiTidakValid(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/detail/:id", h.GetDetail)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/detail/1", nil) // Tanpa set id_user
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestHandler_GetDetail_Gagal_SesiInvalidType(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/detail/:id", func(c *gin.Context) {
		c.Set("id_user", "invalid")
		h.GetDetail(c)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/detail/1", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestHandler_GetDetail_Gagal_UsecaseErrorLain(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/detail/:id", func(c *gin.Context) {
		c.Set("id_user", float64(1))
		c.Set("role", "member")
		h.GetDetail(c)
	})

	mockUC.On("GetDetailTransaksi", mock.Anything, 1, false, 1).Return(nil, errors.New("transaksi tidak ditemukan"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/detail/1", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestHandler_GetRiwayatUser_Gagal_SesiInvalidType(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.GET("/riwayat", func(c *gin.Context) {
		c.Set("id_user", "invalid")
		h.GetRiwayatUser(c)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/riwayat", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestHandler_UpdateStatusPesanan_Gagal_UsecaseError(t *testing.T) {
	mockUC := new(MockTransaksiUsecase)
	h := delivery.NewTransaksiHandler(mockUC)
	r := setupTestRouter(h)

	r.PATCH("/status/:id", h.UpdateStatusPesanan)

	reqBody := map[string]interface{}{"status_pesanan": "Selesai"}
	body, _ := json.Marshal(reqBody)

	mockUC.On("UpdateStatusPesanan", mock.Anything, "TRX-001", "Selesai").Return(errors.New("db error"))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PATCH", "/status/TRX-001", bytes.NewBuffer(body))
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}
