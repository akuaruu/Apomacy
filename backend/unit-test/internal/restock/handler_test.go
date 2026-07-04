package unittest

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	delivery "github.com/akuaruu/apomacy/backend/internal/handler/http"
	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

type restockUsecaseStub struct {
	processFn func(context.Context, *model.Restock) error
}

func (s *restockUsecaseStub) ProcessRestock(ctx context.Context, restock *model.Restock) error {
	return s.processFn(ctx, restock)
}
func (s *restockUsecaseStub) GetRestockDetail(context.Context, int) (*model.Restock, error) {
	return nil, nil
}

func TestRestockHandlerCreate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tests := []struct {
		name, body string
		processErr error
		status     int
	}{
		{name: "success", body: `{"id_supplier":1,"details":[{"id_obat":2,"jumlah":5,"harga_beli":1000}]}`, status: http.StatusCreated},
		{name: "invalid json", body: `{`, status: http.StatusBadRequest},
		{name: "usecase error", body: `{"id_supplier":1,"details":[]}`, processErr: errors.New("invalid restock"), status: http.StatusInternalServerError},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			stub := &restockUsecaseStub{processFn: func(context.Context, *model.Restock) error { return test.processErr }}
			router := gin.New()
			router.POST("/restock", delivery.NewRestockHandler(stub).CreateRestock)
			request := httptest.NewRequest(http.MethodPost, "/restock", bytes.NewBufferString(test.body))
			request.Header.Set("Content-Type", "application/json")
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)
			assert.Equal(t, test.status, response.Code)
		})
	}
}
