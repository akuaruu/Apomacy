package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type userRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) model.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *model.User) error {
	query := `
		INSERT INTO "user" (
			username, password_hash, nama_lengkap, role, no_telp, email, status
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7
		) RETURNING id_user, created_at
	`
	err := r.db.QueryRow(ctx, query,
		user.Username, user.PasswordHash, user.NamaLengkap,
		user.Role, user.NoTelp, user.Email, user.Status,
	).Scan(&user.ID, &user.CreatedAt)

	if err != nil {
		return fmt.Errorf("gagal inser user: %v", err)
	}

	return nil
}

func (r *userRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	query := `SELECT * FROM "user" WHERE username = $1 LIMIT 1`

	var u model.User
	err := r.db.QueryRow(ctx, query, username).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.NamaLengkap,
		&u.Role, &u.NoTelp, &u.Email, &u.Status, &u.CreatedAt, &u.LastLogin,
	)

	if err != nil {
		return nil, fmt.Errorf("user tidak ditemukan: %v", err)
	}
	return &u, nil
}

func (r *userRepository) GetByID(ctx context.Context, id int) (*model.User, error) {
	query := `SELECT * FROM "user" WHERE id_user = $1`

	var u model.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.NamaLengkap,
		&u.Role, &u.NoTelp, &u.Email, &u.Status, &u.CreatedAt, &u.LastLogin,
	)

	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, id int, loginTime time.Time) error {
	query := `UPDATE "user" SET last_login = $1 WHERE id_user = $2`
	_, err := r.db.Exec(ctx, query, loginTime, id)
	return err
}
