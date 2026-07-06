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

type customerUsecaseStub struct {
	createFn  func(context.Context, *model.Customer) error
	getByIDFn func(context.Context, int) (*model.Customer, error)
	getAllFn  func(context.Context) ([]model.Customer, error)
	updateFn  func(context.Context, *model.Customer) error
	deleteFn  func(context.Context, int) error
}

func (s *customerUsecaseStub) CreateCustomer(ctx context.Context, customer *model.Customer) error {
	return s.createFn(ctx, customer)
}
func (s *customerUsecaseStub) GetCustomerByID(ctx context.Context, id int) (*model.Customer, error) {
	return s.getByIDFn(ctx, id)
}
func (s *customerUsecaseStub) GetAllCustomers(ctx context.Context) ([]model.Customer, error) {
	return s.getAllFn(ctx)
}
func (s *customerUsecaseStub) UpdateCustomer(ctx context.Context, customer *model.Customer) error {
	return s.updateFn(ctx, customer)
}
func (s *customerUsecaseStub) DeleteCustomer(ctx context.Context, id int) error {
	return s.deleteFn(ctx, id)
}

func customerRouter(stub *customerUsecaseStub) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	handler := delivery.NewCustomerHandler(stub)
	router.POST("/customer", handler.CreateCustomer)
	router.GET("/customer", handler.GetAllCustomers)
	router.GET("/customer/:id", handler.GetCustomerByID)
	router.PUT("/customer/:id", handler.UpdateCustomer)
	router.DELETE("/customer/:id", handler.DeleteCustomer)
	return router
}

func requestJSON(t *testing.T, router http.Handler, method, path string, payload any) *httptest.ResponseRecorder {
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

func TestCustomerHandlerCRUD(t *testing.T) {
	backendError := errors.New("backend failure")
	stub := &customerUsecaseStub{
		createFn: func(_ context.Context, customer *model.Customer) error {
			assert.Equal(t, "Budi", customer.NamaCustomer)
			return nil
		},
		getByIDFn: func(_ context.Context, id int) (*model.Customer, error) {
			if id == 404 {
				return nil, backendError
			}
			return &model.Customer{ID: id, NamaCustomer: "Budi"}, nil
		},
		getAllFn: func(context.Context) ([]model.Customer, error) {
			return []model.Customer{{ID: 1, NamaCustomer: "Budi"}}, nil
		},
		updateFn: func(_ context.Context, customer *model.Customer) error {
			assert.Equal(t, 8, customer.ID)
			return nil
		},
		deleteFn: func(context.Context, int) error { return nil },
	}
	router := customerRouter(stub)

	t.Run("create success", func(t *testing.T) {
		response := requestJSON(t, router, http.MethodPost, "/customer", map[string]any{"nama_customer": "Budi", "no_telp": "0812"})
		assert.Equal(t, http.StatusCreated, response.Code)
	})
	t.Run("create invalid json", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodPost, "/customer", bytes.NewBufferString("{"))
		request.Header.Set("Content-Type", "application/json")
		response := httptest.NewRecorder()
		router.ServeHTTP(response, request)
		assert.Equal(t, http.StatusBadRequest, response.Code)
	})
	t.Run("get all success", func(t *testing.T) {
		response := requestJSON(t, router, http.MethodGet, "/customer", nil)
		assert.Equal(t, http.StatusOK, response.Code)
		assert.Contains(t, response.Body.String(), "Budi")
	})
	t.Run("get by id success", func(t *testing.T) {
		response := requestJSON(t, router, http.MethodGet, "/customer/7", nil)
		assert.Equal(t, http.StatusOK, response.Code)
	})
	t.Run("get by id invalid parameter", func(t *testing.T) {
		response := requestJSON(t, router, http.MethodGet, "/customer/not-number", nil)
		assert.Equal(t, http.StatusBadRequest, response.Code)
	})
	t.Run("get by id not found", func(t *testing.T) {
		response := requestJSON(t, router, http.MethodGet, "/customer/404", nil)
		assert.Equal(t, http.StatusNotFound, response.Code)
	})
	t.Run("update success", func(t *testing.T) {
		response := requestJSON(t, router, http.MethodPut, "/customer/8", map[string]any{"nama_customer": "Budi"})
		assert.Equal(t, http.StatusOK, response.Code)
	})
	t.Run("delete success", func(t *testing.T) {
		response := requestJSON(t, router, http.MethodDelete, "/customer/8", nil)
		assert.Equal(t, http.StatusOK, response.Code)
	})
	t.Run("delete invalid parameter", func(t *testing.T) {
		response := requestJSON(t, router, http.MethodDelete, "/customer/x", nil)
		assert.Equal(t, http.StatusBadRequest, response.Code)
	})
}

func TestCustomerHandlerUsecaseFailures(t *testing.T) {
	backendError := errors.New("database unavailable")
	stub := &customerUsecaseStub{
		createFn:  func(context.Context, *model.Customer) error { return backendError },
		getByIDFn: func(context.Context, int) (*model.Customer, error) { return nil, backendError },
		getAllFn:  func(context.Context) ([]model.Customer, error) { return nil, backendError },
		updateFn:  func(context.Context, *model.Customer) error { return backendError },
		deleteFn:  func(context.Context, int) error { return backendError },
	}
	router := customerRouter(stub)

	tests := []struct {
		method string
		path   string
		body   any
		status int
	}{
		{method: http.MethodPost, path: "/customer", body: map[string]any{"nama_customer": "Budi"}, status: http.StatusInternalServerError},
		{method: http.MethodGet, path: "/customer", status: http.StatusInternalServerError},
		{method: http.MethodGet, path: "/customer/1", status: http.StatusNotFound},
		{method: http.MethodPut, path: "/customer/1", body: map[string]any{"nama_customer": "Budi"}, status: http.StatusInternalServerError},
		{method: http.MethodDelete, path: "/customer/1", status: http.StatusInternalServerError},
	}
	for _, test := range tests {
		response := requestJSON(t, router, test.method, test.path, test.body)
		assert.Equal(t, test.status, response.Code, "%s %s", test.method, test.path)
	}
}
