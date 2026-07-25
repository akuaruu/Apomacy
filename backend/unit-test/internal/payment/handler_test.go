package unittest

import (
	"bytes"
	"context"
	"crypto/sha512"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	delivery "github.com/akuaruu/apomacy/backend/internal/handler/http"
	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/midtrans/midtrans-go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type paymentUsecaseStub struct {
	generateFn func(string, int64, string, []midtrans.ItemDetails) (string, error)
}

func (s *paymentUsecaseStub) GenerateSnapToken(orderID string, amount int64, method string, items []midtrans.ItemDetails) (string, error) {
	return s.generateFn(orderID, amount, method, items)
}

type paymentTransactionStub struct {
	updateFn  func(context.Context, string, model.StatusTransaksi) error
	getByNoFn func(context.Context, string) (*model.Transaksi, error)
}

func (s *paymentTransactionStub) Checkout(context.Context, *model.Transaksi) error { return nil }
func (s *paymentTransactionStub) GetDetailTransaksi(context.Context, int, bool, int) (*model.Transaksi, error) {
	return nil, nil
}
func (s *paymentTransactionStub) GetByNoTransaksi(ctx context.Context, noTransaksi string) (*model.Transaksi, error) {
	return s.getByNoFn(ctx, noTransaksi)
}
func (s *paymentTransactionStub) BatalkanTransaksi(context.Context, int) error { return nil }
func (s *paymentTransactionStub) UpdateStatusByNoTransaksi(ctx context.Context, number string, status model.StatusTransaksi) error {
	return s.updateFn(ctx, number, status)
}
func (s *paymentTransactionStub) GetRiwayatByUser(context.Context, int) ([]*model.Transaksi, error) {
	return nil, nil
}
func (s *paymentTransactionStub) GetAll(context.Context) ([]model.Transaksi, error) { return nil, nil }
func (s *paymentTransactionStub) UpdateStatusPesanan(context.Context, string, string) error {
	return nil
}

func paymentRouter(payment *paymentUsecaseStub, transaction *paymentTransactionStub) *gin.Engine {
	gin.SetMode(gin.TestMode)
	handler := delivery.NewPaymentHandler(payment, transaction)
	router := gin.New()
	router.POST("/checkout", func(c *gin.Context) {
		c.Set("id_user", float64(4))
		handler.Checkout(c)
	})
	router.POST("/webhook", handler.WebhookNotification)
	return router
}

func paymentRequest(t *testing.T, router http.Handler, path string, payload any) *httptest.ResponseRecorder {
	t.Helper()
	var body bytes.Buffer
	require.NoError(t, json.NewEncoder(&body).Encode(payload))
	request := httptest.NewRequest(http.MethodPost, path, &body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	return response
}

func TestPaymentCheckoutHandler(t *testing.T) {
	t.Run("success maps request to Midtrans items", func(t *testing.T) {
		payment := &paymentUsecaseStub{generateFn: func(orderID string, amount int64, method string, items []midtrans.ItemDetails) (string, error) {
			assert.Equal(t, "TRX-1", orderID)
			assert.Equal(t, int64(25000), amount)
			assert.Equal(t, "qris", method)
			require.Len(t, items, 1)
			assert.Equal(t, int64(12500), items[0].Price)
			assert.Equal(t, int32(2), items[0].Qty)
			return "snap-token", nil
		}}
		transaction := &paymentTransactionStub{getByNoFn: func(_ context.Context, noTransaksi string) (*model.Transaksi, error) {
			assert.Equal(t, "TRX-1", noTransaksi)
			return &model.Transaksi{
				IDUser:      4,
				NoTransaksi: "TRX-1",
				TotalBayar:  25000,
				Status:      model.TxPending,
				Details:     []model.DetailTransaksi{{IDObat: 1, NamaObat: "Obat", HargaSatuan: 12500, Qty: 2}},
			}, nil
		}}
		router := paymentRouter(payment, transaction)
		response := paymentRequest(t, router, "/checkout", map[string]any{"order_id": "TRX-1", "gross_amount": 1, "payment_method": "qris", "items": []map[string]any{{"id": "1", "price": 1, "quantity": 2, "name": "Obat"}}})
		assert.Equal(t, http.StatusOK, response.Code)
		assert.Contains(t, response.Body.String(), "snap-token")
	})

	t.Run("invalid request", func(t *testing.T) {
		router := paymentRouter(&paymentUsecaseStub{}, &paymentTransactionStub{})
		response := paymentRequest(t, router, "/checkout", map[string]any{})
		assert.Equal(t, http.StatusBadRequest, response.Code)
	})

	t.Run("Midtrans error", func(t *testing.T) {
		payment := &paymentUsecaseStub{generateFn: func(string, int64, string, []midtrans.ItemDetails) (string, error) {
			return "", errors.New("midtrans unavailable")
		}}
		transaction := &paymentTransactionStub{getByNoFn: func(context.Context, string) (*model.Transaksi, error) {
			return &model.Transaksi{
				IDUser:      4,
				NoTransaksi: "TRX-1",
				TotalBayar:  25000,
				Status:      model.TxPending,
				Details:     []model.DetailTransaksi{{IDObat: 1, NamaObat: "Obat", HargaSatuan: 25000, Qty: 1}},
			}, nil
		}}
		response := paymentRequest(t, paymentRouter(payment, transaction), "/checkout", map[string]any{"order_id": "TRX-1", "payment_method": "qris"})
		assert.Equal(t, http.StatusInternalServerError, response.Code)
	})

	t.Run("rejects order owned by another user", func(t *testing.T) {
		transaction := &paymentTransactionStub{getByNoFn: func(context.Context, string) (*model.Transaksi, error) {
			return &model.Transaksi{IDUser: 99, NoTransaksi: "TRX-1", TotalBayar: 25000, Status: model.TxPending}, nil
		}}
		response := paymentRequest(t, paymentRouter(&paymentUsecaseStub{}, transaction), "/checkout", map[string]any{"order_id": "TRX-1", "payment_method": "qris"})
		assert.Equal(t, http.StatusForbidden, response.Code)
	})
}

func webhookSignature(orderID, statusCode, amount, key string) string {
	hash := sha512.Sum512([]byte(orderID + statusCode + amount + key))
	return fmt.Sprintf("%x", hash)
}

func TestPaymentWebhookHandler(t *testing.T) {
	const key = "server-key"
	t.Setenv("MIDTRANS_SERVER_KEY", key)
	tests := []struct {
		name, transactionStatus, fraudStatus string
		signatureValid                       bool
		updateError                          error
		wantStatus                           int
		wantUpdate                           bool
		wantTransactionStatus                model.StatusTransaksi
	}{
		{name: "settlement", transactionStatus: "settlement", signatureValid: true, wantStatus: http.StatusOK, wantUpdate: true, wantTransactionStatus: model.TxSelesai},
		{name: "accepted capture", transactionStatus: "capture", fraudStatus: "accept", signatureValid: true, wantStatus: http.StatusOK, wantUpdate: true, wantTransactionStatus: model.TxSelesai},
		{name: "denied", transactionStatus: "deny", signatureValid: true, wantStatus: http.StatusOK, wantUpdate: true, wantTransactionStatus: model.TxBatal},
		{name: "expired", transactionStatus: "expire", signatureValid: true, wantStatus: http.StatusOK, wantUpdate: true, wantTransactionStatus: model.TxBatal},
		{name: "canceled", transactionStatus: "cancel", signatureValid: true, wantStatus: http.StatusOK, wantUpdate: true, wantTransactionStatus: model.TxBatal},
		{name: "pending does not update", transactionStatus: "pending", signatureValid: true, wantStatus: http.StatusOK},
		{name: "invalid signature", transactionStatus: "settlement", wantStatus: http.StatusUnauthorized},
		{name: "update failure requests webhook retry", transactionStatus: "settlement", signatureValid: true, updateError: errors.New("database failed"), wantStatus: http.StatusInternalServerError, wantUpdate: true, wantTransactionStatus: model.TxSelesai},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			updated := false
			transaction := &paymentTransactionStub{updateFn: func(_ context.Context, orderID string, status model.StatusTransaksi) error {
				updated = true
				assert.Equal(t, "TRX-1", orderID)
				assert.Equal(t, test.wantTransactionStatus, status)
				return test.updateError
			}}
			payload := delivery.MidtransNotification{OrderID: "TRX-1", StatusCode: "200", GrossAmount: "25000.00", TransactionStatus: test.transactionStatus, FraudStatus: test.fraudStatus, SignatureKey: "invalid"}
			if test.signatureValid {
				payload.SignatureKey = webhookSignature(payload.OrderID, payload.StatusCode, payload.GrossAmount, key)
			}
			response := paymentRequest(t, paymentRouter(&paymentUsecaseStub{}, transaction), "/webhook", payload)
			assert.Equal(t, test.wantStatus, response.Code)
			assert.Equal(t, test.wantUpdate, updated)
		})
	}
}

func TestPaymentWebhookRejectsMalformedJSON(t *testing.T) {
	router := paymentRouter(&paymentUsecaseStub{}, &paymentTransactionStub{})
	request := httptest.NewRequest(http.MethodPost, "/webhook", bytes.NewBufferString("{"))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	assert.Equal(t, http.StatusBadRequest, response.Code)
}
