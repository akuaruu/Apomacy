package http

import (
	"net/http"

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
	var req model.User

	//Bind JSON req ke struxct user
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
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
