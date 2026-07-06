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
	// 1. Tangkap ID User langsung dari claim JWT Middleware (Aman & Dinamis)
	userIDRaw, exists := c.Get("id_user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid, harap login kembali"})
		return
	}

	// Konversi tipe data float64 dari JWT ke integer
	userIDFloat, ok := userIDRaw.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Format ID user tidak valid"})
		return
	}
	userID := int(userIDFloat)

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

// GetProfile menangani request pengambilan data gabungan profil
func (h *UserHandler) GetProfile(c *gin.Context) {
	// 1. Tangkap ID User dari JWT Middleware yang sudah diamankan
	userIDRaw, exists := c.Get("id_user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid, harap login kembali"})
		return
	}

	// 2. Konversi tipe data (JWT id_user biasanya dibaca sebagai float64 oleh golang)
	userIDFloat, ok := userIDRaw.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Format ID user tidak valid"})
		return
	}
	userID := int(userIDFloat)

	// 3. Panggil usecase
	profile, err := h.usecase.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data profil"})
		return
	}

	// 4. Kirim response sesuai harapan Frontend
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil memuat profil",
		"data":    profile,
	})
}

// UpdateProfile menangani request untuk mengubah data teks profil user
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	// 1. Ambil ID User dari token JWT (Aman, tidak bisa dipalsukan)
	userIDRaw, exists := c.Get("id_user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid, harap login kembali"})
		return
	}

	// Konversi float64 (bawaan JWT) ke int
	userIDFloat, ok := userIDRaw.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Format ID user tidak valid"})
		return
	}
	userID := int(userIDFloat)

	// 2. Buat struct penangkap JSON yang datang dari Frontend (page.tsx)
	var req struct {
		NamaLengkap  string `json:"nama_lengkap"`
		NoTelp       string `json:"no_telp"`
		TanggalLahir string `json:"tanggal_lahir"`
		Alamat       string `json:"alamat"`
	}

	// 3. Pasangkan (Bind) data JSON ke dalam struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid: " + err.Error()})
		return
	}

	// 4. Panggil Usecase untuk mengeksekusi logika dan simpan ke DB
	err := h.usecase.UpdateProfileText(c.Request.Context(), userID, req.NamaLengkap, req.NoTelp, req.TanggalLahir, req.Alamat)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan profil: " + err.Error()})
		return
	}

	// 5. Kembalikan response 200 OK ke frontend
	c.JSON(http.StatusOK, gin.H{"message": "Data profil berhasil diperbarui"})
}

// GetAllStaff mengambil semua user dengan role Admin/Kasir
func (h *UserHandler) GetAllStaff(c *gin.Context) {
	users, err := h.usecase.GetAllStaff(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data karyawan: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": users})
}

// UpdateUserByAdmin memperbarui data user oleh admin
func (h *UserHandler) UpdateUserByAdmin(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID harus berupa angka"})
		return
	}

	var req struct {
		NamaLengkap string `json:"nama_lengkap"`
		NoTelp      string `json:"no_telp"`
		Email       string `json:"email"`
		Role        string `json:"role"`
		Status      string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid: " + err.Error()})
		return
	}

	user := &model.User{
		ID:          id,
		NamaLengkap: req.NamaLengkap,
		NoTelp:      req.NoTelp,
		Email:       req.Email,
		Role:        model.UserRole(req.Role),
		Status:      model.UserStatus(req.Status),
	}

	if err := h.usecase.UpdateUserByAdmin(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data karyawan berhasil diperbarui"})
}

// DeleteUser menghapus user berdasarkan ID
func (h *UserHandler) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID harus berupa angka"})
		return
	}

	if err := h.usecase.DeleteUser(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Karyawan berhasil dihapus"})
}
