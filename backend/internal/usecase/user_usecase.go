package usecase

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type userUsecase struct {
	repo model.UserRepository
}

func NewUserUsecase(repo model.UserRepository) model.UserUsecase {
	return &userUsecase{repo: repo}
}

func (u *userUsecase) Register(ctx context.Context, user *model.User) error {
	// 1. Hash Password menggunakan bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("gagal memproses password")
	}

	// 2. Timpa password asli dengan hash
	user.PasswordHash = string(hashedPassword)

	// 3. Set default status jika belum diisi
	if user.Status == "" {
		user.Status = model.StatusAktif
	}

	// 4. Lempar ke database
	return u.repo.Create(ctx, user)
}

func (u *userUsecase) Login(ctx context.Context, username, password string) (string, error) {
	// 1. Cari user di database
	user, err := u.repo.GetByUsername(ctx, username)
	if err != nil {
		return "", errors.New("username atau password salah")
	}

	// 2. Cek kecocokan password hash
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return "", errors.New("username atau password salah")
	}

	// 3. Cek status user (kalau resign tidak boleh login)
	if user.Status != model.StatusAktif {
		return "", errors.New("akun anda tidak aktif")
	}

	// 4. Update Last Login di background
	_ = u.repo.UpdateLastLogin(ctx, user.ID, time.Now())

	// 5. Generate JWT Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id_user": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token expired dalam 24 jam
	})

	// Ambil secret key dari environment
	secretKey := os.Getenv("JWT_SECRET")

	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", errors.New("gagal membuat sesi login")
	}

	return tokenString, nil
}

func (u *userUsecase) GetProfile(ctx context.Context, id int) (*model.User, error) {
	return u.repo.GetByID(ctx, id)
}
