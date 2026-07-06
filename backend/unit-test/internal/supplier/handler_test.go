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
	"github.com/stretchr/testify/require"
)

type supplierUsecaseStub struct {
	createFn  func(context.Context, *model.Supplier) error
	getByIDFn func(context.Context, int) (*model.Supplier, error)
	getAllFn  func(context.Context) ([]model.Supplier, error)
	updateFn  func(context.Context, *model.Supplier) error
	deleteFn  func(context.Context, int) error
}

func (s *supplierUsecaseStub) CreateSupplier(ctx context.Context, value *model.Supplier) error {
	return s.createFn(ctx, value)
}
func (s *supplierUsecaseStub) GetSupplierByID(ctx context.Context, id int) (*model.Supplier, error) {
	return s.getByIDFn(ctx, id)
}
func (s *supplierUsecaseStub) GetAllSuppliers(ctx context.Context) ([]model.Supplier, error) {
	return s.getAllFn(ctx)
}
func (s *supplierUsecaseStub) UpdateSupplier(ctx context.Context, value *model.Supplier) error {
	return s.updateFn(ctx, value)
}
func (s *supplierUsecaseStub) DeleteSupplier(ctx context.Context, id int) error {
	return s.deleteFn(ctx, id)
}

func supplierRouter(stub *supplierUsecaseStub) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	handler := delivery.NewSupplierHandler(stub)
	router.POST("/supplier", handler.CreateSupplier)
	router.GET("/supplier", handler.GetAllSuppliers)
	router.GET("/supplier/:id", handler.GetSupplierByID)
	router.PUT("/supplier/:id", handler.UpdateSupplier)
	router.DELETE("/supplier/:id", handler.DeleteSupplier)
	return router
}

func supplierRequest(t *testing.T, router http.Handler, method, path string, payload any) *httptest.ResponseRecorder {
	t.Helper()
	var body bytes.Buffer
	if payload != nil {
		require.NoError(t, json.NewEncoder(&body).Encode(payload))
	}
	request := httptest.NewRequest(method, path, &body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	return response
}

func TestSupplierHandlerHappyPaths(t *testing.T) {
	stub := &supplierUsecaseStub{
		createFn: func(context.Context, *model.Supplier) error { return nil },
		getByIDFn: func(_ context.Context, id int) (*model.Supplier, error) {
			return &model.Supplier{ID: id, KodeSupplier: "SUP-1"}, nil
		},
		getAllFn: func(context.Context) ([]model.Supplier, error) {
			return []model.Supplier{{ID: 1, KodeSupplier: "SUP-1"}}, nil
		},
		updateFn: func(context.Context, *model.Supplier) error { return nil },
		deleteFn: func(context.Context, int) error { return nil },
	}
	router := supplierRouter(stub)
	payload := map[string]any{"kode_supplier": "SUP-1", "nama_supplier": "Medika"}

	assert.Equal(t, http.StatusCreated, supplierRequest(t, router, http.MethodPost, "/supplier", payload).Code)
	assert.Equal(t, http.StatusOK, supplierRequest(t, router, http.MethodGet, "/supplier", nil).Code)
	assert.Equal(t, http.StatusOK, supplierRequest(t, router, http.MethodGet, "/supplier/1", nil).Code)
	assert.Equal(t, http.StatusOK, supplierRequest(t, router, http.MethodPut, "/supplier/1", payload).Code)
	assert.Equal(t, http.StatusOK, supplierRequest(t, router, http.MethodDelete, "/supplier/1", nil).Code)
}

func TestSupplierHandlerUnhappyPaths(t *testing.T) {
	backendError := errors.New("repository failed")
	notFound := errors.New("supplier tidak ditemukan")
	stub := &supplierUsecaseStub{
		createFn:  func(context.Context, *model.Supplier) error { return backendError },
		getByIDFn: func(context.Context, int) (*model.Supplier, error) { return nil, backendError },
		getAllFn:  func(context.Context) ([]model.Supplier, error) { return nil, backendError },
		updateFn:  func(context.Context, *model.Supplier) error { return backendError },
		deleteFn: func(_ context.Context, id int) error {
			if id == 404 {
				return notFound
			}
			return backendError
		},
	}
	router := supplierRouter(stub)
	payload := map[string]any{"kode_supplier": "SUP-1", "nama_supplier": "Medika"}

	assert.Equal(t, http.StatusInternalServerError, supplierRequest(t, router, http.MethodPost, "/supplier", payload).Code)
	assert.Equal(t, http.StatusInternalServerError, supplierRequest(t, router, http.MethodGet, "/supplier", nil).Code)
	assert.Equal(t, http.StatusNotFound, supplierRequest(t, router, http.MethodGet, "/supplier/1", nil).Code)
	assert.Equal(t, http.StatusBadRequest, supplierRequest(t, router, http.MethodGet, "/supplier/x", nil).Code)
	assert.Equal(t, http.StatusInternalServerError, supplierRequest(t, router, http.MethodPut, "/supplier/1", payload).Code)
	assert.Equal(t, http.StatusNotFound, supplierRequest(t, router, http.MethodDelete, "/supplier/404", nil).Code)
	assert.Equal(t, http.StatusInternalServerError, supplierRequest(t, router, http.MethodDelete, "/supplier/1", nil).Code)
	assert.Equal(t, http.StatusBadRequest, supplierRequest(t, router, http.MethodDelete, "/supplier/x", nil).Code)

	request := httptest.NewRequest(http.MethodPost, "/supplier", bytes.NewBufferString("{"))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	assert.Equal(t, http.StatusBadRequest, response.Code)
}
