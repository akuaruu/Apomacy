package http

import (
	"net/http"
	"strconv"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/akuaruu/apomacy/backend/pkg/storage"
	"github.com/gin-gonic/gin"
)

type ObatHandler struct {
	usecase model.ObatUsecase
}

func NewObatHandler(usecase model.ObatUsecase) *ObatHandler {
	return &ObatHandler{
		usecase: usecase,
	}
}

// Handler untuk menambah obat baru
func (h *ObatHandler) CreateObat(c *gin.Context) {
	var req model.Obat

	// 1. Ganti ShouldBindJSON menjadi ShouldBind agar bisa membaca form-data
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid: " + err.Error()})
		return
	}

	// 2. Tangkap file fisik dari input bernama "gambar_produk"
	file, err := c.FormFile("gambar_produk")
	if err == nil {
		// Jika ada file, panggil fungsi helper upload Supabase yang kita buat sebelumnya
		imageURL, uploadErr := storage.UploadToSupabase(file)
		if uploadErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengunggah gambar"})
			return
		}
		// 3. Masukkan URL publik Supabase ke dalam struct
		req.GambarProduk = &imageURL
	}

	// 4. Lempar data ke Usecase (Business Logic tetap sama)
	if err := h.usecase.CreateObat(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Obat berhasil ditambahkan"})
}

// Handler untuk mengambil semua data obat
func (h *ObatHandler) GetAllObat(c *gin.Context) {
	listObat, err := h.usecase.GetAllObat(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": listObat})
}

// Handler untuk mengambil satu obat berdasarkan ID
func (h *ObatHandler) GetObatByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID harus berupa angka"})
		return
	}

	obat, err := h.usecase.GetObatByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Obat tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": obat})
}

// Handler untuk mengupdate data obat
func (h *ObatHandler) UpdateObat(c *gin.Context) {
	var req model.Obat
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	// Ambil ID dari URL parameter dan pastikan masuk ke struct
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	req.ID = id

	if err := h.usecase.UpdateObat(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Obat berhasil diupdate"})
}

// Handler untuk menghapus obat
func (h *ObatHandler) DeleteObat(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID harus berupa angka"})
		return
	}

	if err := h.usecase.DeleteObat(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Obat berhasil dihapus"})
}
