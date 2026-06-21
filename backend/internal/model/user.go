package model

import (
	"context"
	"time"
)

// ENUM DEfinition
type UserRole string

const (
	RoleAdmin  UserRole = "Admin"
	RoleKasir  UserRole = "Kasir"
	RoleMember UserRole = "Member"
)

type UserStatus string

const (
	StatusAktif  UserStatus = "Aktif"
	StatusCuti   UserStatus = "cuti"
	StatusResign UserStatus = "Resign"
)

// Table user
type User struct {
	ID       int    `json:"id_user"`
	Username string `json:"username"`

	// Gunakan json:"-" agar password tidak pernah ikut terkirim ke Frontend
	PasswordHash string `json:"-"`

	NamaLengkap string     `json:"nama_lengkap"`
	Role        UserRole   `json:"role"`
	NoTelp      string     `json:"no_telp"`
	Email       string     `json:"email"`
	Status      UserStatus `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	LastLogin   *time.Time `json:"last_login"` // Bisa NULL jika user belum pernah login
	FotoProfil  string     `json:"foto_profil" db:"foto_profil"`
}

// Struct tambahan khusus untuk response halaman Profil Frontend
type UserProfile struct {
	NamaLengkap  string `json:"nama"`
	Email        string `json:"email"`
	NoTelp       string `json:"telepon"`
	TanggalLahir string `json:"tanggalLahir"`
	Alamat       string `json:"alamat"`
	FotoProfil   string `json:"fotoProfil"`
}

// UserRepository contract
type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByUsername(ctx context.Context, username string) (*User, error)
	GetByID(ctx context.Context, id int) (*User, error)
	UpdateLastLogin(ctx context.Context, id int, loginTime time.Time) error
	UpdateFotoProfil(ctx context.Context, userID int, fotoURL string) error
	GetProfile(ctx context.Context, id int) (*UserProfile, error)
	UpdateProfileText(ctx context.Context, userID int, nama string, noTelp string, tglLahir string, alamat string) error
}

// UserUsecase contract
type UserUsecase interface {
	Register(ctx context.Context, user *User) error
	Login(ctx context.Context, username, password string) (string, error)
	GetProfile(ctx context.Context, id int) (*UserProfile, error)
	UploadFotoProfil(ctx context.Context, userID int, fileBytes []byte, fileName, contentType string) (string, error)
	UpdateProfileText(ctx context.Context, userID int, nama string, noTelp string, tglLahir string, alamat string) error
}
