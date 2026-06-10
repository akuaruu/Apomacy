package http

import (
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

// GetDetail mengambil riwayat spesifik transaksi beserta rincian obat yang dibeli
func (h *TransaksiHandler) GetDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter ID harus berupa angka"})
		return
	}

	trx, err := h.usecase.GetDetailTransaksi(c.Request.Context(), id)
	if err != nil {
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
