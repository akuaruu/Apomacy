package usecase

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
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
		"nama":    user.NamaLengkap,
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

func (u *userUsecase) GetProfile(ctx context.Context, id int) (*model.UserProfile, error) {
	return u.repo.GetProfile(ctx, id)
}

func (u *userUsecase) UploadFotoProfil(ctx context.Context, userID int, fileBytes []byte, fileName, contentType string) (string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	bucketName := "profil_user"

	if supabaseURL == "" || supabaseKey == "" {
		return "", errors.New("konfigurasi env supabase tidak ditemukan")
	}
	// Endpoint: POST /storage/v1/object/profil_user/{fileName}
	uploadEndpoint := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseURL, bucketName, fileName)

	// 2. Siapkan Request
	req, err := http.NewRequestWithContext(ctx, "POST", uploadEndpoint, bytes.NewReader(fileBytes))
	if err != nil {
		return "", errors.New("gagal menyiapkan request upload")
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", contentType)

	// 3. Eksekusi Request ke Supabase
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", errors.New("gagal menghubungi supabase storage")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("gagal upload ke storage, status code: %d", resp.StatusCode)
	}

	// 4. Generate Public URL dari file yang berhasil diunggah
	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseURL, bucketName, fileName)

	// 5. Simpan URL ke Database menggunakan Repository
	err = u.repo.UpdateFotoProfil(ctx, userID, publicURL)
	if err != nil {
		return "", errors.New("gagal menyimpan link foto ke database")
	}

	return publicURL, nil
}
