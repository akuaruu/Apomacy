package http

import (
	"net/http"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
)

type RestockHandler struct {
	usecase model.RestockUsecase
}

func NewRestockHandler(usecase model.RestockUsecase) *RestockHandler {
	return &RestockHandler{usecase: usecase}
}

func (h *RestockHandler) CreateRestock(c *gin.Context) {
	// Menggunakan model.Restock (bukan model.RestockHeader)
	var req model.Restock

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid: " + err.Error()})
		return
	}

	// Panggil usecase.ProcessRestock (bukan CreateRestock)
	if err := h.usecase.ProcessRestock(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Data penerimaan restock berhasil diproses dan stok telah diupdate",
	})
}
