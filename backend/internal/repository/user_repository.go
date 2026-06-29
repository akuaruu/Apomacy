package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
)

type userRepository struct {
	db DBTx
}

func NewUserRepository(db DBTx) model.UserRepository {
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
	query := `
        SELECT id_user, username, password_hash, nama_lengkap, 
               role, no_telp, email, status, created_at, last_login
        FROM "user" 
        WHERE username = $1 
        LIMIT 1
    `
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
	query := `
        SELECT id_user, username, password_hash, nama_lengkap,
               role, no_telp, email, status, created_at, last_login
        FROM "user" 
        WHERE id_user = $1
    `
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

func (r *userRepository) UpdateFotoProfil(ctx context.Context, userID int, fotoURL string) error {
	query := `UPDATE public.user SET foto_profil = $1 WHERE id_user = $2`

	_, err := r.db.Exec(ctx, query, fotoURL, userID)
	if err != nil {
		return err
	}
	return nil
}

func (r *userRepository) GetProfile(ctx context.Context, id int) (*model.UserProfile, error) {
	query := `
		SELECT 
			u.nama_lengkap, 
			u.email, 
			COALESCE(u.foto_profil, '') as foto_profil,
			COALESCE(c.no_telp, u.no_telp) as no_telp,
			COALESCE(CAST(c.tanggal_lahir AS VARCHAR), '') as tanggal_lahir,
			COALESCE(c.alamat, '') as alamat
		FROM public.user u
		LEFT JOIN public.customer c ON c.id_user = u.id_user
		WHERE u.id_user = $1
	`

	var profile model.UserProfile
	err := r.db.QueryRow(ctx, query, id).Scan(
		&profile.NamaLengkap,
		&profile.Email,
		&profile.FotoProfil,
		&profile.NoTelp,
		&profile.TanggalLahir,
		&profile.Alamat,
	)

	if err != nil {
		return nil, err
	}

	return &profile, nil
}

func (r *userRepository) UpdateProfileText(
	ctx context.Context,
	userID int,
	nama string,
	noTelp string,
	tglLahir string,
	alamat string,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE public."user"
		SET
			nama_lengkap = $1,
			no_telp = $2
		WHERE id_user = $3
	`, nama, noTelp, userID)

	if err != nil {
		return fmt.Errorf("gagal memperbarui data user: %v", err)
	}

	result, err := r.db.Exec(ctx, `
		UPDATE public.customer
		SET
			nama_customer = $1,
			no_telp = $2,
			alamat = $3,
			tanggal_lahir = CASE
				WHEN $4 = '' THEN tanggal_lahir
				ELSE $4::date
			END
		WHERE id_user = $5
	`, nama, noTelp, alamat, tglLahir, userID)

	if err != nil {
		return fmt.Errorf("gagal memperbarui data customer: %v", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("data customer untuk user %d belum tersedia", userID)
	}

	return nil
}
