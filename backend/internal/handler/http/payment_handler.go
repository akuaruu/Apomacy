package http

import (
	"net/http"

	"github.com/akuaruu/apomacy/backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	paymentUsecase *usecase.PaymentUsecase
}

func NewPaymentHandler(u *usecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{paymentUsecase: u}
}

// Request payload dari Next.js
type CheckoutRequest struct {
	OrderID       string `json:"order_id" binding:"required"`
	GrossAmount   int64  `json:"gross_amount" binding:"required"`
	PaymentMethod string `json:"payment_method" binding:"required"`
}

func (h *PaymentHandler) Checkout(c *gin.Context) {
	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request salah"})
		return
	}

	// Panggil usecase untuk dapatkan token
	token, err := h.paymentUsecase.GenerateSnapToken(req.OrderID, req.GrossAmount, req.PaymentMethod)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat transaksi Midtrans"})
		return
	}

	// Kembalikan token ke Next.js
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil membuat Snap Token",
		"token":   token,
	})
}
