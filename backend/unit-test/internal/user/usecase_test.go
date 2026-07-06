package unittest

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/auth"
	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/akuaruu/apomacy/backend/internal/usecase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return f(request)
}

func stubHTTPTransport(t *testing.T, fn roundTripFunc) {
	t.Helper()
	original := http.DefaultTransport
	http.DefaultTransport = fn
	t.Cleanup(func() { http.DefaultTransport = original })
}

type userRepositoryStub struct {
	createFn            func(context.Context, *model.User) error
	getByUsernameFn     func(context.Context, string) (*model.User, error)
	getByIDFn           func(context.Context, int) (*model.User, error)
	updateLastLoginFn   func(context.Context, int, time.Time) error
	updateFotoFn        func(context.Context, int, string) error
	getProfileFn        func(context.Context, int) (*model.UserProfile, error)
	updateProfileTextFn func(context.Context, int, string, string, string, string) error
	getAllStaffFn       func(context.Context) ([]model.User, error)
	deleteFn            func(context.Context, int) error
	updateByAdminFn     func(context.Context, *model.User) error
}

func (s *userRepositoryStub) Create(ctx context.Context, value *model.User) error {
	return s.createFn(ctx, value)
}
func (s *userRepositoryStub) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	return s.getByUsernameFn(ctx, username)
}
func (s *userRepositoryStub) GetByID(ctx context.Context, id int) (*model.User, error) {
	return s.getByIDFn(ctx, id)
}
func (s *userRepositoryStub) UpdateLastLogin(ctx context.Context, id int, value time.Time) error {
	return s.updateLastLoginFn(ctx, id, value)
}
func (s *userRepositoryStub) UpdateFotoProfil(ctx context.Context, id int, url string) error {
	return s.updateFotoFn(ctx, id, url)
}
func (s *userRepositoryStub) GetProfile(ctx context.Context, id int) (*model.UserProfile, error) {
	return s.getProfileFn(ctx, id)
}
func (s *userRepositoryStub) UpdateProfileText(ctx context.Context, id int, name, phone, birthDate, address string) error {
	return s.updateProfileTextFn(ctx, id, name, phone, birthDate, address)
}
func (s *userRepositoryStub) GetAllStaff(ctx context.Context) ([]model.User, error) {
	return s.getAllStaffFn(ctx)
}
func (s *userRepositoryStub) Delete(ctx context.Context, id int) error { return s.deleteFn(ctx, id) }
func (s *userRepositoryStub) UpdateByAdmin(ctx context.Context, value *model.User) error {
	return s.updateByAdminFn(ctx, value)
}

type userCustomerRepositoryStub struct {
	createFn func(context.Context, *model.Customer) error
}

func (s *userCustomerRepositoryStub) Create(ctx context.Context, value *model.Customer) error {
	return s.createFn(ctx, value)
}
func (s *userCustomerRepositoryStub) GetByID(context.Context, int) (*model.Customer, error) {
	return nil, nil
}
func (s *userCustomerRepositoryStub) GetAll(context.Context) ([]model.Customer, error) {
	return nil, nil
}
func (s *userCustomerRepositoryStub) Update(context.Context, *model.Customer) error { return nil }
func (s *userCustomerRepositoryStub) Delete(context.Context, int) error             { return nil }

func TestUserUsecaseRegister(t *testing.T) {
	t.Run("success hashes password and creates customer", func(t *testing.T) {
		userRepo := &userRepositoryStub{createFn: func(_ context.Context, user *model.User) error {
			assert.NotEqual(t, "secret123", user.PasswordHash)
			require.NoError(t, bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("secret123")))
			user.ID = 12
			return nil
		}}
		customerRepo := &userCustomerRepositoryStub{createFn: func(_ context.Context, customer *model.Customer) error {
			assert.Equal(t, "MBR000012", customer.NoMember)
			assert.Equal(t, "user@example.com", *customer.Email)
			assert.Equal(t, 12, *customer.IDUser)
			return nil
		}}
		uc := usecase.NewUserUsecase(userRepo, customerRepo)
		user := &model.User{Username: "user@example.com", Email: "user@example.com", NamaLengkap: "Budi", NoTelp: "0812", PasswordHash: "secret123"}
		require.NoError(t, uc.Register(context.Background(), user))
		assert.Equal(t, model.StatusAktif, user.Status)
	})

	t.Run("user repository failure stops customer creation", func(t *testing.T) {
		customerCalled := false
		userRepo := &userRepositoryStub{createFn: func(context.Context, *model.User) error { return errors.New("user insert failed") }}
		customerRepo := &userCustomerRepositoryStub{createFn: func(context.Context, *model.Customer) error { customerCalled = true; return nil }}
		uc := usecase.NewUserUsecase(userRepo, customerRepo)
		err := uc.Register(context.Background(), &model.User{PasswordHash: "secret123"})
		require.EqualError(t, err, "user insert failed")
		assert.False(t, customerCalled)
	})

	t.Run("customer repository failure is wrapped", func(t *testing.T) {
		userRepo := &userRepositoryStub{createFn: func(_ context.Context, user *model.User) error { user.ID = 2; return nil }}
		customerRepo := &userCustomerRepositoryStub{createFn: func(context.Context, *model.Customer) error { return errors.New("customer insert failed") }}
		uc := usecase.NewUserUsecase(userRepo, customerRepo)
		err := uc.Register(context.Background(), &model.User{PasswordHash: "secret123"})
		require.Error(t, err)
		assert.Contains(t, err.Error(), "gagal membuat customer")
	})
}

func TestUserUsecaseLogin(t *testing.T) {
	t.Setenv("JWT_SECRET", "unit-test-secret-that-is-long-enough")
	hash, err := bcrypt.GenerateFromPassword([]byte("correct-password"), bcrypt.MinCost)
	require.NoError(t, err)

	tests := []struct {
		name      string
		user      *model.User
		lookupErr error
		password  string
		wantError string
		wantToken bool
	}{
		{name: "success", user: &model.User{ID: 5, Username: "admin@example.com", NamaLengkap: "Admin", Role: model.RoleAdmin, Status: model.StatusAktif, PasswordHash: string(hash)}, password: "correct-password", wantToken: true},
		{name: "unknown user", lookupErr: errors.New("not found"), password: "correct-password", wantError: "username atau password salah"},
		{name: "wrong password", user: &model.User{Status: model.StatusAktif, PasswordHash: string(hash)}, password: "wrong", wantError: "username atau password salah"},
		{name: "inactive account", user: &model.User{Status: model.StatusResign, PasswordHash: string(hash)}, password: "correct-password", wantError: "akun anda tidak aktif"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			userRepo := &userRepositoryStub{
				getByUsernameFn:   func(context.Context, string) (*model.User, error) { return test.user, test.lookupErr },
				updateLastLoginFn: func(context.Context, int, time.Time) error { return errors.New("non-critical update failed") },
			}
			uc := usecase.NewUserUsecase(userRepo, &userCustomerRepositoryStub{})
			token, err := uc.Login(context.Background(), "admin@example.com", test.password)
			if test.wantError != "" {
				require.EqualError(t, err, test.wantError)
				assert.Empty(t, token)
				return
			}
			require.NoError(t, err)
			assert.NotEmpty(t, token)
			claims, err := auth.ValidateToken(token)
			require.NoError(t, err)
			assert.Equal(t, float64(5), claims["id_user"])
			assert.Equal(t, string(model.RoleAdmin), claims["role"])
		})
	}
}

func TestUserUsecaseProfileAndStaffDelegation(t *testing.T) {
	repoError := errors.New("repository failed")
	profile := &model.UserProfile{NamaLengkap: "Budi"}
	userRepo := &userRepositoryStub{
		getProfileFn: func(_ context.Context, id int) (*model.UserProfile, error) {
			assert.Equal(t, 4, id)
			return profile, nil
		},
		updateProfileTextFn: func(_ context.Context, id int, name, phone, birthDate, address string) error {
			if id == 99 {
				return repoError
			}
			return nil
		},
		getAllStaffFn: func(context.Context) ([]model.User, error) { return []model.User{{ID: 1, Role: model.RoleAdmin}}, nil },
		deleteFn: func(_ context.Context, id int) error {
			if id == 99 {
				return repoError
			}
			return nil
		},
		updateByAdminFn: func(_ context.Context, user *model.User) error {
			if user.ID == 99 {
				return repoError
			}
			return nil
		},
	}
	uc := usecase.NewUserUsecase(userRepo, &userCustomerRepositoryStub{})

	result, err := uc.GetProfile(context.Background(), 4)
	require.NoError(t, err)
	assert.Equal(t, profile, result)
	require.EqualError(t, uc.UpdateProfileText(context.Background(), 0, "Budi", "0812", "", ""), "ID user tidak valid")
	require.EqualError(t, uc.UpdateProfileText(context.Background(), 4, "", "0812", "", ""), "nama lengkap tidak boleh kosong")
	require.NoError(t, uc.UpdateProfileText(context.Background(), 4, "Budi", "0812", "", "Bandung"))
	require.ErrorIs(t, uc.UpdateProfileText(context.Background(), 99, "Budi", "0812", "", "Bandung"), repoError)
	staff, err := uc.GetAllStaff(context.Background())
	require.NoError(t, err)
	require.Len(t, staff, 1)
	require.NoError(t, uc.DeleteUser(context.Background(), 1))
	require.ErrorIs(t, uc.DeleteUser(context.Background(), 99), repoError)
	require.NoError(t, uc.UpdateUserByAdmin(context.Background(), &model.User{ID: 1}))
	require.ErrorIs(t, uc.UpdateUserByAdmin(context.Background(), &model.User{ID: 99}), repoError)
}

func TestUserUsecaseUploadFotoProfil(t *testing.T) {
	t.Run("missing configuration", func(t *testing.T) {
		t.Setenv("SUPABASE_URL", "")
		t.Setenv("SUPABASE_KEY", "")
		uc := usecase.NewUserUsecase(&userRepositoryStub{}, &userCustomerRepositoryStub{})
		_, err := uc.UploadFotoProfil(context.Background(), 1, []byte("image"), "profile.png", "image/png")
		require.EqualError(t, err, "konfigurasi env supabase tidak ditemukan")
	})

	t.Run("success uploads and stores public url", func(t *testing.T) {
		stubHTTPTransport(t, func(request *http.Request) (*http.Response, error) {
			assert.Equal(t, "Bearer storage-key", request.Header.Get("Authorization"))
			assert.Equal(t, "image/png", request.Header.Get("Content-Type"))
			body, err := io.ReadAll(request.Body)
			require.NoError(t, err)
			assert.Equal(t, []byte("image"), body)
			return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(bytes.NewReader(nil))}, nil
		})
		t.Setenv("SUPABASE_URL", "https://storage.example.test")
		t.Setenv("SUPABASE_KEY", "storage-key")
		userRepo := &userRepositoryStub{updateFotoFn: func(_ context.Context, id int, url string) error {
			assert.Equal(t, 1, id)
			assert.Equal(t, "https://storage.example.test/storage/v1/object/public/profil_user/profile.png", url)
			return nil
		}}
		uc := usecase.NewUserUsecase(userRepo, &userCustomerRepositoryStub{})
		url, err := uc.UploadFotoProfil(context.Background(), 1, []byte("image"), "profile.png", "image/png")
		require.NoError(t, err)
		assert.Contains(t, url, "/profil_user/profile.png")
	})

	t.Run("storage rejects upload", func(t *testing.T) {
		stubHTTPTransport(t, func(*http.Request) (*http.Response, error) {
			return &http.Response{StatusCode: http.StatusBadRequest, Body: io.NopCloser(bytes.NewReader(nil))}, nil
		})
		t.Setenv("SUPABASE_URL", "https://storage.example.test")
		t.Setenv("SUPABASE_KEY", "storage-key")
		uc := usecase.NewUserUsecase(&userRepositoryStub{}, &userCustomerRepositoryStub{})
		_, err := uc.UploadFotoProfil(context.Background(), 1, []byte("image"), "profile.png", "image/png")
		require.EqualError(t, err, "gagal upload ke storage, status code: 400")
	})

	t.Run("database update failure", func(t *testing.T) {
		stubHTTPTransport(t, func(*http.Request) (*http.Response, error) {
			return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(bytes.NewReader(nil))}, nil
		})
		t.Setenv("SUPABASE_URL", "https://storage.example.test")
		t.Setenv("SUPABASE_KEY", "storage-key")
		userRepo := &userRepositoryStub{updateFotoFn: func(context.Context, int, string) error { return errors.New("update failed") }}
		uc := usecase.NewUserUsecase(userRepo, &userCustomerRepositoryStub{})
		_, err := uc.UploadFotoProfil(context.Background(), 1, []byte("image"), "profile.png", "image/png")
		require.EqualError(t, err, "gagal menyimpan link foto ke database")
	})
}
