package unittest

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	delivery "github.com/akuaruu/apomacy/backend/internal/handler/http"
	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type obatUsecaseStub struct {
	createFn  func(context.Context, *model.Obat) error
	getByIDFn func(context.Context, int) (*model.Obat, error)
	getAllFn  func(context.Context) ([]model.Obat, error)
	updateFn  func(context.Context, *model.Obat) error
	deleteFn  func(context.Context, int) error
}

func (s *obatUsecaseStub) CreateObat(ctx context.Context, value *model.Obat) error {
	return s.createFn(ctx, value)
}
func (s *obatUsecaseStub) GetObatByID(ctx context.Context, id int) (*model.Obat, error) {
	return s.getByIDFn(ctx, id)
}
func (s *obatUsecaseStub) GetAllObat(ctx context.Context) ([]model.Obat, error) {
	return s.getAllFn(ctx)
}
func (s *obatUsecaseStub) UpdateObat(ctx context.Context, value *model.Obat) error {
	return s.updateFn(ctx, value)
}
func (s *obatUsecaseStub) DeleteObat(ctx context.Context, id int) error {
	return s.deleteFn(ctx, id)
}

func obatRouter(stub *obatUsecaseStub) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	handler := delivery.NewObatHandler(stub)
	router.POST("/obat", handler.CreateObat)
	router.GET("/obat", handler.GetAllObat)
	router.GET("/obat/:id", handler.GetObatByID)
	router.PUT("/obat/:id", handler.UpdateObat)
	router.DELETE("/obat/:id", handler.DeleteObat)
	return router
}

func obatJSONRequest(t *testing.T, router http.Handler, method, path string, payload any) *httptest.ResponseRecorder {
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

func TestObatHandlerHappyPaths(t *testing.T) {
	stub := &obatUsecaseStub{
		createFn: func(_ context.Context, obat *model.Obat) error {
			assert.Equal(t, "Paracetamol", obat.NamaObat)
			return nil
		},
		getByIDFn: func(_ context.Context, id int) (*model.Obat, error) {
			return &model.Obat{ID: id, NamaObat: "Paracetamol"}, nil
		},
		getAllFn: func(context.Context) ([]model.Obat, error) {
			return []model.Obat{{ID: 1, NamaObat: "Paracetamol"}}, nil
		},
		updateFn: func(context.Context, *model.Obat) error { return nil },
		deleteFn: func(context.Context, int) error { return nil },
	}
	router := obatRouter(stub)

	var multipartBody bytes.Buffer
	writer := multipart.NewWriter(&multipartBody)
	require.NoError(t, writer.WriteField("nama_obat", "Paracetamol"))
	require.NoError(t, writer.Close())
	request := httptest.NewRequest(http.MethodPost, "/obat", &multipartBody)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	assert.Equal(t, http.StatusCreated, response.Code)

	assert.Equal(t, http.StatusOK, obatJSONRequest(t, router, http.MethodGet, "/obat", nil).Code)
	assert.Equal(t, http.StatusOK, obatJSONRequest(t, router, http.MethodGet, "/obat/1", nil).Code)
	assert.Equal(t, http.StatusOK, obatJSONRequest(t, router, http.MethodPut, "/obat/1", map[string]any{"nama_obat": "Paracetamol"}).Code)
	assert.Equal(t, http.StatusOK, obatJSONRequest(t, router, http.MethodDelete, "/obat/1", nil).Code)
}

func TestObatHandlerUnhappyPaths(t *testing.T) {
	backendError := errors.New("backend failure")
	stub := &obatUsecaseStub{
		createFn:  func(context.Context, *model.Obat) error { return backendError },
		getByIDFn: func(context.Context, int) (*model.Obat, error) { return nil, backendError },
		getAllFn:  func(context.Context) ([]model.Obat, error) { return nil, backendError },
		updateFn:  func(context.Context, *model.Obat) error { return backendError },
		deleteFn:  func(context.Context, int) error { return backendError },
	}
	router := obatRouter(stub)

	assert.Equal(t, http.StatusInternalServerError, obatJSONRequest(t, router, http.MethodGet, "/obat", nil).Code)
	assert.Equal(t, http.StatusNotFound, obatJSONRequest(t, router, http.MethodGet, "/obat/1", nil).Code)
	assert.Equal(t, http.StatusBadRequest, obatJSONRequest(t, router, http.MethodGet, "/obat/x", nil).Code)
	assert.Equal(t, http.StatusInternalServerError, obatJSONRequest(t, router, http.MethodPut, "/obat/1", map[string]any{"nama_obat": "Paracetamol"}).Code)
	assert.Equal(t, http.StatusInternalServerError, obatJSONRequest(t, router, http.MethodDelete, "/obat/1", nil).Code)
	assert.Equal(t, http.StatusBadRequest, obatJSONRequest(t, router, http.MethodDelete, "/obat/x", nil).Code)

	request := httptest.NewRequest(http.MethodPut, "/obat/1", bytes.NewBufferString("{"))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	assert.Equal(t, http.StatusBadRequest, response.Code)
}
