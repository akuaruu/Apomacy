package unittest

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/akuaruu/apomacy/backend/internal/repository"
	"github.com/pashagolub/pgxmock/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserRepositoryCoreQueries(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewUserRepository(db)
	now := time.Now()
	user := &model.User{Username: "admin@example.com", PasswordHash: "hash", NamaLengkap: "Admin", Role: model.RoleAdmin, NoTelp: "0812", Email: "admin@example.com", Status: model.StatusAktif}

	db.ExpectQuery(`INSERT INTO "user"`).WithArgs(user.Username, user.PasswordHash, user.NamaLengkap, user.Role, user.NoTelp, user.Email, user.Status).
		WillReturnRows(pgxmock.NewRows([]string{"id_user", "created_at"}).AddRow(1, now))
	require.NoError(t, repo.Create(context.Background(), user))
	assert.Equal(t, 1, user.ID)

	columns := []string{"id_user", "username", "password_hash", "nama_lengkap", "role", "no_telp", "email", "status", "created_at", "last_login"}
	db.ExpectQuery(`SELECT id_user, username, password_hash`).WithArgs(user.Username).
		WillReturnRows(pgxmock.NewRows(columns).AddRow(1, user.Username, user.PasswordHash, user.NamaLengkap, user.Role, user.NoTelp, user.Email, user.Status, now, nil))
	result, err := repo.GetByUsername(context.Background(), user.Username)
	require.NoError(t, err)
	assert.Equal(t, user.Username, result.Username)

	db.ExpectQuery(`SELECT id_user, username, password_hash`).WithArgs(1).
		WillReturnRows(pgxmock.NewRows(columns).AddRow(1, user.Username, user.PasswordHash, user.NamaLengkap, user.Role, user.NoTelp, user.Email, user.Status, now, nil))
	_, err = repo.GetByID(context.Background(), 1)
	require.NoError(t, err)

	db.ExpectExec(`UPDATE "user" SET last_login`).WithArgs(now, 1).WillReturnResult(pgxmock.NewResult("UPDATE", 1))
	require.NoError(t, repo.UpdateLastLogin(context.Background(), 1, now))
	db.ExpectExec(`UPDATE public.user SET foto_profil`).WithArgs("photo", 1).WillReturnResult(pgxmock.NewResult("UPDATE", 1))
	require.NoError(t, repo.UpdateFotoProfil(context.Background(), 1, "photo"))
	require.NoError(t, db.ExpectationsWereMet())
}

func TestUserRepositoryProfileAndStaff(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewUserRepository(db)
	now := time.Now()

	db.ExpectQuery(`SELECT.*u.nama_lengkap`).WithArgs(2).WillReturnRows(pgxmock.NewRows([]string{"nama_lengkap", "email", "foto_profil", "no_telp", "tanggal_lahir", "alamat"}).AddRow("Budi", "budi@example.com", "", "0812", "2000-01-01", "Bandung"))
	profile, err := repo.GetProfile(context.Background(), 2)
	require.NoError(t, err)
	assert.Equal(t, "Budi", profile.NamaLengkap)

	db.ExpectExec(`UPDATE public."user"`).WithArgs("Budi", "0812", 2).WillReturnResult(pgxmock.NewResult("UPDATE", 1))
	db.ExpectExec(`UPDATE public.customer`).WithArgs("Budi", "0812", "Bandung", "2000-01-01", 2).WillReturnResult(pgxmock.NewResult("UPDATE", 1))
	require.NoError(t, repo.UpdateProfileText(context.Background(), 2, "Budi", "0812", "2000-01-01", "Bandung"))

	db.ExpectQuery(`SELECT id_user, username, nama_lengkap`).WillReturnRows(pgxmock.NewRows([]string{"id_user", "username", "nama_lengkap", "role", "no_telp", "email", "status", "created_at", "last_login"}).AddRow(1, "admin@example.com", "Admin", model.RoleAdmin, "0812", "admin@example.com", model.StatusAktif, now, nil))
	staff, err := repo.GetAllStaff(context.Background())
	require.NoError(t, err)
	require.Len(t, staff, 1)

	db.ExpectExec(`DELETE FROM "user"`).WithArgs(1).WillReturnResult(pgxmock.NewResult("DELETE", 1))
	require.NoError(t, repo.Delete(context.Background(), 1))
	db.ExpectExec(`UPDATE "user"`).WithArgs("Admin", "0812", "admin@example.com", model.RoleAdmin, model.StatusAktif, 1).WillReturnResult(pgxmock.NewResult("UPDATE", 1))
	require.NoError(t, repo.UpdateByAdmin(context.Background(), &model.User{ID: 1, NamaLengkap: "Admin", NoTelp: "0812", Email: "admin@example.com", Role: model.RoleAdmin, Status: model.StatusAktif}))
	require.NoError(t, db.ExpectationsWereMet())
}

func TestUserRepositoryFailures(t *testing.T) {
	db, err := pgxmock.NewPool()
	require.NoError(t, err)
	defer db.Close()
	repo := repository.NewUserRepository(db)
	backendError := errors.New("database unavailable")

	db.ExpectQuery(`INSERT INTO "user"`).WithArgs(pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg(), pgxmock.AnyArg()).WillReturnError(backendError)
	require.Error(t, repo.Create(context.Background(), &model.User{}))
	db.ExpectQuery(`SELECT id_user, username, password_hash`).WithArgs("missing").WillReturnError(backendError)
	_, err = repo.GetByUsername(context.Background(), "missing")
	require.Error(t, err)
	db.ExpectQuery(`SELECT.*u.nama_lengkap`).WithArgs(9).WillReturnError(backendError)
	_, err = repo.GetProfile(context.Background(), 9)
	require.Error(t, err)
	db.ExpectExec(`UPDATE public."user"`).WithArgs("Budi", "0812", 9).WillReturnError(backendError)
	require.Error(t, repo.UpdateProfileText(context.Background(), 9, "Budi", "0812", "", ""))
	db.ExpectExec(`DELETE FROM "user"`).WithArgs(9).WillReturnResult(pgxmock.NewResult("DELETE", 0))
	require.Error(t, repo.Delete(context.Background(), 9))
	db.ExpectExec(`UPDATE "user"`).WithArgs("", "", "", model.UserRole(""), model.UserStatus(""), 9).WillReturnResult(pgxmock.NewResult("UPDATE", 0))
	require.Error(t, repo.UpdateByAdmin(context.Background(), &model.User{ID: 9}))
	require.NoError(t, db.ExpectationsWereMet())
}
