package http

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
)

// UserHandler bertugas menangani request HTTP terkait User
type UserHandler struct {
	usecase model.UserUsecase
}

// NewUserHandler menginisialisasi handler untuk User
func NewUserHandler(usecase model.UserUsecase) *UserHandler {
	return &UserHandler{
		usecase: usecase,
	}
}

// menerima JSON untuk register user baru
func (h *UserHandler) Register(c *gin.Context) {
	// 1. Buat struct khusus untuk menangkap data dari Frontend
	var req struct {
		NamaLengkap string `json:"nama_lengkap" binding:"required"`
		Email       string `json:"email" binding:"required"`
		Username    string `json:"username" binding:"required"`
		NoTelp      string `json:"no_telp" binding:"required"`
		Password    string `json:"password" binding:"required"`
	}

	// 2. Bind JSON ke struct req
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid: " + err.Error()})
		return
	}

	// 3. Pindahkan data ke model User yang asli
	user := model.User{
		NamaLengkap:  req.NamaLengkap,
		Email:        req.Email,
		Username:     req.Username,
		NoTelp:       req.NoTelp,
		PasswordHash: req.Password,     // Taruh password polos di sini sementara, akan di-hash oleh Usecase
		Role:         model.RoleMember, // Berikan default role
		Status:       model.StatusAktif,
	}

	// 4. Lempar ke layer Usecase untuk proses Hash dan Insert ke Database
	if err := h.usecase.Register(c.Request.Context(), &user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mendaftarkan user: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi berhasil"})
}

// Login (terima usernam & pass), mengembalikan JWT Token
func (h *UserHandler) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username dan password salah"})
		return
	}

	//LEmpar ke layer Usecase
	token, err := h.usecase.Login(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   token,
	})
}

func (h *UserHandler) UploadFotoProfil(c *gin.Context) {
	// 1. Tangkap ID User (Bisa dari parameter URL, idealnya dari claim JWT JWT Middleware)
	idParam := c.Param("id")
	userID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID user tidak valid"})
		return
	}

	// 2. Tangkap file dengan key "foto" dari form-data
	file, header, err := c.Request.FormFile("foto")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File foto tidak ditemukan dalam request"})
		return
	}
	defer file.Close()

	// 3. Baca file menjadi bentuk byte
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca file"})
		return
	}

	// 4. Buat nama file unik (Mencegah file tertimpa jika namanya sama)
	timestamp := time.Now().Unix()
	fileName := fmt.Sprintf("user_%d_%d_%s", userID, timestamp, header.Filename)
	contentType := header.Header.Get("Content-Type")

	// 5. Panggil Usecase
	fotoURL, err := h.usecase.UploadFotoProfil(c.Request.Context(), userID, fileBytes, fileName, contentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Foto profil berhasil diperbarui",
		"url":     fotoURL,
	})
}
