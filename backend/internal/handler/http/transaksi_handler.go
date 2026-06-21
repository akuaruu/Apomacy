package http

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
)

type TransaksiHandler struct {
	usecase model.TransaksiUsecase
}

func NewTransaksiHandler(usecase model.TransaksiUsecase) *TransaksiHandler {
	return &TransaksiHandler{usecase: usecase}
}

type UpdateStatusPesananRequest struct {
	StatusPesanan string `json:"status_pesanan" binding:"required"`
}

// Checkout memproses keranjang belanja dari kasir
func (h *TransaksiHandler) Checkout(c *gin.Context) {
	var req model.Transaksi

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request transaksi tidak valid", "detail": err.Error()})
		return
	}

	// Ambil id_user dari JWT context (di-set oleh RequireAuth)  ← ganti blok validasi lama
	idUser, exists := c.Get("id_user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid"})
		return
	}
	req.IDUser = int(idUser.(float64))

	if err := h.usecase.Checkout(c.Request.Context(), &req); err != nil {
		// tambah log ini sementara
		fmt.Printf("[ERROR] Checkout gagal: %+v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses transaksi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Transaksi berhasil disimpan",
		"data": gin.H{
			"id_transaksi": req.ID,
			"no_transaksi": req.NoTransaksi,
		},
	})
}

// GetDetail mengambil riwayat spesifik transaksi beserta rincian obat dan pengiriman
func (h *TransaksiHandler) GetDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter ID harus berupa angka"})
		return
	}

	idUserRaw, exists := c.Get("id_user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid"})
		return
	}
	idUserFloat, ok := idUserRaw.(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid"})
		return
	}

	// role diasumsikan di-set oleh middleware RequireAuth dari klaim JWT
	role, _ := c.Get("role")
	isStaff := role == "kasir" || role == "admin"

	trx, err := h.usecase.GetDetailTransaksi(c.Request.Context(), int(idUserFloat), isStaff, id)
	if err != nil {
		if err.Error() == "akses ditolak: transaksi ini bukan milik anda" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": trx})
}

// Batalkan mengubah status transaksi menjadi Batal
func (h *TransaksiHandler) Batalkan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter ID harus berupa angka"})
		return
	}

	if err := h.usecase.BatalkanTransaksi(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membatalkan transaksi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status transaksi berhasil diubah menjadi Batal"})
}

func (h *TransaksiHandler) GetRiwayatUser(c *gin.Context) {
	idUserRaw, exists := c.Get("id_user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid"})
		return
	}
	idUserFloat, ok := idUserRaw.(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid"})
		return
	}

	data, err := h.usecase.GetRiwayatByUser(c.Request.Context(), int(idUserFloat))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil riwayat transaksi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": data})
}

// GetAll mengambil seluruh data transaksi untuk Dashboard Kasir / Admin
func (h *TransaksiHandler) GetAll(c *gin.Context) {
	transactions, err := h.usecase.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil seluruh data transaksi", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil menarik data transaksi",
		"data":    transactions,
	})
}

func (h *TransaksiHandler) UpdateStatusPesanan(c *gin.Context) {
	noTransaksi := c.Param("id")

	var req UpdateStatusPesananRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	if err := h.usecase.UpdateStatusPesanan(c.Request.Context(), noTransaksi, req.StatusPesanan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate status pesanan", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Status pesanan berhasil diperbarui",
		"status_baru": req.StatusPesanan,
	})
}
