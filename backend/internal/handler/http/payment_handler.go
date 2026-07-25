package http

import (
	"context"
	"crypto/sha512"
	"fmt"
	"log/slog"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/midtrans/midtrans-go"
)

type ItemReq struct {
	ID       string `json:"id"`
	Price    int64  `json:"price"`
	Quantity int32  `json:"quantity"`
	Name     string `json:"name"`
}

type CheckoutRequest struct {
	OrderID       string    `json:"order_id" binding:"required"`
	GrossAmount   int64     `json:"gross_amount"`
	PaymentMethod string    `json:"payment_method" binding:"required"`
	Items         []ItemReq `json:"items"`
}

type MidtransNotification struct {
	TransactionStatus string `json:"transaction_status"`
	OrderID           string `json:"order_id"`
	FraudStatus       string `json:"fraud_status"`
	GrossAmount       string `json:"gross_amount"`
	StatusCode        string `json:"status_code"`
	SignatureKey      string `json:"signature_key"`
}

type PaymentHandler struct {
	paymentUsecase   paymentUsecase
	transaksiUsecase model.TransaksiUsecase
}

type paymentUsecase interface {
	GenerateSnapToken(string, int64, string, []midtrans.ItemDetails) (string, error)
}

func NewPaymentHandler(u paymentUsecase, tu model.TransaksiUsecase) *PaymentHandler {
	return &PaymentHandler{
		paymentUsecase:   u,
		transaksiUsecase: tu,
	}
}

func (h *PaymentHandler) Checkout(c *gin.Context) {
	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request salah"})
		return
	}

	idUser, ok := contextUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid"})
		return
	}

	trx, err := h.transaksiUsecase.GetByNoTransaksi(c.Request.Context(), req.OrderID)
	if err != nil {
		slog.WarnContext(c.Request.Context(), "checkout order lookup failed", "error", err, "order_id", req.OrderID, "request_id", requestID(c))
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaksi tidak ditemukan"})
		return
	}
	if trx.IDUser != idUser {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk transaksi ini"})
		return
	}
	if trx.Status != model.TxPending {
		c.JSON(http.StatusConflict, gin.H{"error": "Transaksi tidak dapat diproses ulang"})
		return
	}

	grossAmount := int64(math.Round(trx.TotalBayar))
	midtransItems, err := midtransItemsFromTransaction(trx, grossAmount)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	token, err := h.paymentUsecase.GenerateSnapToken(trx.NoTransaksi, grossAmount, req.PaymentMethod, midtransItems)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat transaksi Midtrans"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil membuat Snap Token",
		"token":   token,
	})
}

func midtransItemsFromTransaction(trx *model.Transaksi, grossAmount int64) ([]midtrans.ItemDetails, error) {
	if len(trx.Details) == 0 {
		return nil, fmt.Errorf("detail transaksi tidak ditemukan")
	}

	items := make([]midtrans.ItemDetails, 0, len(trx.Details)+1)
	itemsTotal := int64(0)
	for _, detail := range trx.Details {
		price := int64(math.Round(detail.HargaSatuan))
		if detail.IDObat <= 0 || detail.Qty <= 0 || price <= 0 {
			return nil, fmt.Errorf("detail transaksi tidak valid")
		}
		qty := int32(detail.Qty)
		items = append(items, midtrans.ItemDetails{
			ID:    strconv.Itoa(detail.IDObat),
			Price: price,
			Qty:   qty,
			Name:  detail.NamaObat,
		})
		itemsTotal += price * int64(qty)
	}

	remaining := grossAmount - itemsTotal
	if remaining < 0 {
		return nil, fmt.Errorf("total transaksi tidak valid")
	}
	if remaining > 0 {
		items = append(items, midtrans.ItemDetails{
			ID:    "ONGKIR-01",
			Price: remaining,
			Qty:   1,
			Name:  "Biaya Pengiriman",
		})
	}

	return items, nil
}

// WebhookNotification menerima notifikasi dari Midtrans dan mengupdate status transaksi di DB
func (h *PaymentHandler) WebhookNotification(c *gin.Context) {
	var notification MidtransNotification
	if err := c.ShouldBindJSON(&notification); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format notifikasi tidak valid"})
		return
	}

	// Verifikasi signature key untuk keamanan
	// Format: SHA512(order_id + status_code + gross_amount + server_key)
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	rawSignature := notification.OrderID + notification.StatusCode + notification.GrossAmount + serverKey
	hash := sha512.Sum512([]byte(rawSignature))
	expectedSignature := fmt.Sprintf("%x", hash)

	if notification.SignatureKey != expectedSignature {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Signature tidak valid"})
		return
	}

	// status berdasarkan hasil pembayaran Midtrans
	var newStatus model.StatusTransaksi
	txStatus := notification.TransactionStatus
	fraudStatus := notification.FraudStatus

	switch {
	case txStatus == "capture" && fraudStatus == "accept":
		newStatus = model.TxSelesai
	case txStatus == "settlement":
		newStatus = model.TxSelesai
	case txStatus == "deny", txStatus == "expire", txStatus == "cancel":
		newStatus = model.TxBatal
	default:
		// Status pending atau lainnya
		c.Status(http.StatusOK)
		return
	}

	// Update status transaksi di database
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	if err := h.transaksiUsecase.UpdateStatusByNoTransaksi(ctx, notification.OrderID, newStatus); err != nil {
		slog.ErrorContext(c.Request.Context(), "midtrans webhook update failed", "error", err, "order_id", notification.OrderID, "request_id", requestID(c))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses webhook"})
		return
	}

	slog.InfoContext(c.Request.Context(), "midtrans webhook processed", "order_id", notification.OrderID, "status", newStatus, "request_id", requestID(c))
	c.Status(http.StatusOK)
}
