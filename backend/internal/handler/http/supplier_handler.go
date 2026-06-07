package http

import (
	"net/http"
	"strconv"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
)

type SupplierHandler struct {
	usecase model.SupplierUsecase
}

func NewSupplierHandler(usecase model.SupplierUsecase) *SupplierHandler {
	return &SupplierHandler{usecase: usecase}
}

func (h *SupplierHandler) CreateSupplier(c *gin.Context) {
	var req model.Supplier
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	if err := h.usecase.CreateSupplier(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Supplier berhasil ditambahkan", "data": req})
}

func (h *SupplierHandler) GetAllSuppliers(c *gin.Context) {
	listSupplier, err := h.usecase.GetAllSuppliers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": listSupplier})
}

func (h *SupplierHandler) GetSupplierByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID harus berupa angka"})
		return
	}

	supplier, err := h.usecase.GetSupplierByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Supplier tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": supplier})
}

func (h *SupplierHandler) UpdateSupplier(c *gin.Context) {
	var req model.Supplier
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	id, _ := strconv.Atoi(c.Param("id"))
	req.ID = id

	if err := h.usecase.UpdateSupplier(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Supplier berhasil diupdate"})
}

func (h *SupplierHandler) DeleteSupplier(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID harus berupa angka"})
		return
	}

	if err := h.usecase.DeleteSupplier(c.Request.Context(), id); err != nil {
		if err.Error() == "supplier tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data supplier: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Supplier berhasil dihapus"})
}
