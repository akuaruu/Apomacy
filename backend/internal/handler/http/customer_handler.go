package http

import (
	"net/http"
	"strconv"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
)

type CustomerHandler struct {
	usecase model.CustomerUsecase
}

func NewCustomerHandler(usecase model.CustomerUsecase) *CustomerHandler {
	return &CustomerHandler{
		usecase: usecase,
	}
}

func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
	var req model.Customer
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	if err := h.usecase.CreateCustomer(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Customer berhasil didaftarkan"})
}

func (h *CustomerHandler) GetAllCustomers(c *gin.Context) {
	customers, err := h.usecase.GetAllCustomers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customers})
}

func (h *CustomerHandler) GetCustomerByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID harus berupa angka"})
		return
	}

	customer, err := h.usecase.GetCustomerByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customer})
}

func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	var req model.Customer
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	req.ID = id

	if err := h.usecase.UpdateCustomer(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer berhasil diupdate"})
}
