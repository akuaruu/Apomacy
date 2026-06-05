package http

import (
	"fmt"
	"net/http"

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
}

type PaymentHandler struct {
	paymentUsecase *usecase.PaymentUsecase
}

func NewPaymentHandler(u *usecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{paymentUsecase: u}
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

func (h *PaymentHandler) WebhookNotification(c *gin.Context) {
	var notification MidtransNotification

	if err := c.ShouldBindJSON(&notification); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format salah"})
		return
	}

	if notification.TransactionStatus == "capture" || notification.TransactionStatus == "settlement" {
		fmt.Printf("Pesanan %s LUNAS!\n", notification.OrderID)
	} else if notification.TransactionStatus == "deny" || notification.TransactionStatus == "expire" || notification.TransactionStatus == "cancel" {
		fmt.Printf("Pesanan %s GAGAL/KADALUARSA!\n", notification.OrderID)
	}

	c.Status(http.StatusOK)
}
