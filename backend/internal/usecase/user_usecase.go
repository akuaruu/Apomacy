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
	userRepo     model.UserRepository
	customerRepo model.CustomerRepository
}

func NewUserUsecase(
	userRepo model.UserRepository,
	customerRepo model.CustomerRepository,
) model.UserUsecase {
	return &userUsecase{
		userRepo:     userRepo,
		customerRepo: customerRepo,
	}
}

func (u *userUsecase) Register(ctx context.Context, user *model.User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(user.PasswordHash),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return errors.New("gagal memproses password")
	}

	user.PasswordHash = string(hashedPassword)

	if user.Status == "" {
		user.Status = model.StatusAktif
	}

	if err := u.userRepo.Create(ctx, user); err != nil {
		return err
	}

	customer := model.Customer{
		NoMember:      fmt.Sprintf("MBR%06d", user.ID),
		NamaCustomer:  user.NamaLengkap,
		NoTelp:        user.NoTelp,
		Email:         user.Email,
		TanggalDaftar: time.Now(),
		IDUser:        user.ID,
	}

	if err := u.customerRepo.Create(ctx, &customer); err != nil {
		return fmt.Errorf("gagal membuat customer: %v", err)
	}

	return nil
}

func (u *userUsecase) Login(ctx context.Context, username, password string) (string, error) {
	// 1. Cari user di database
	user, err := u.userRepo.GetByUsername(ctx, username)
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
	_ = u.userRepo.UpdateLastLogin(ctx, user.ID, time.Now())

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
	return u.userRepo.GetProfile(ctx, id)
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
	err = u.userRepo.UpdateFotoProfil(ctx, userID, publicURL)
	if err != nil {
		return "", errors.New("gagal menyimpan link foto ke database")
	}

	return publicURL, nil
}

func (u *userUsecase) UpdateProfileText(ctx context.Context, userID int, nama string, noTelp string, tglLahir string, alamat string) error {
	// Validasi dasar
	if userID <= 0 {
		return errors.New("ID user tidak valid")
	}
	if nama == "" {
		return errors.New("nama lengkap tidak boleh kosong")
	}

	// Teruskan ke repository untuk eksekusi query
	return u.userRepo.UpdateProfileText(ctx, userID, nama, noTelp, tglLahir, alamat)
}
