package http

import (
	"context"
	"crypto/sha512"
	"fmt"
	"net/http"
	"os"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/akuaruu/apomacy/backend/internal/usecase"
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
	GrossAmount   int64     `json:"gross_amount" binding:"required"`
	PaymentMethod string    `json:"payment_method" binding:"required"`
	Items         []ItemReq `json:"items" binding:"required"`
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
	paymentUsecase   *usecase.PaymentUsecase
	transaksiUsecase model.TransaksiUsecase
}

func NewPaymentHandler(u *usecase.PaymentUsecase, tu model.TransaksiUsecase) *PaymentHandler {
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

	var midtransItems []midtrans.ItemDetails
	for _, item := range req.Items {
		midtransItems = append(midtransItems, midtrans.ItemDetails{
			ID:    item.ID,
			Price: item.Price,
			Qty:   item.Quantity,
			Name:  item.Name,
		})
	}

	token, err := h.paymentUsecase.GenerateSnapToken(req.OrderID, req.GrossAmount, req.PaymentMethod, midtransItems)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat transaksi Midtrans"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil membuat Snap Token",
		"token":   token,
	})
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
		// Status pending atau lainnya — tidak perlu update
		c.Status(http.StatusOK)
		return
	}

	// Update status transaksi di database
	if err := h.transaksiUsecase.UpdateStatusByNoTransaksi(context.Background(), notification.OrderID, newStatus); err != nil {
		fmt.Printf("[WEBHOOK ERROR] Gagal update transaksi %s: %v\n", notification.OrderID, err)
		// Tetap return 200 agar Midtrans tidak retry terus-menerus
		c.Status(http.StatusOK)
		return
	}

	fmt.Printf("[WEBHOOK] Transaksi %s diupdate ke status: %s\n", notification.OrderID, newStatus)
	c.Status(http.StatusOK)
}
