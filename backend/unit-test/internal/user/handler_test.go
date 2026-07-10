package unittest

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	delivery "github.com/akuaruu/apomacy/backend/internal/handler/http"
	"github.com/akuaruu/apomacy/backend/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type userUsecaseStub struct {
	registerFn      func(context.Context, *model.User) error
	loginFn         func(context.Context, string, string) (string, error)
	profileFn       func(context.Context, int) (*model.UserProfile, error)
	uploadFn        func(context.Context, int, []byte, string, string) (string, error)
	updateProfileFn func(context.Context, int, string, string, string, string) error
	staffFn         func(context.Context) ([]model.User, error)
	deleteFn        func(context.Context, int) error
	updateStaffFn   func(context.Context, *model.User) error
}

func (s *userUsecaseStub) Register(ctx context.Context, user *model.User) error {
	return s.registerFn(ctx, user)
}
func (s *userUsecaseStub) Login(ctx context.Context, username, password string) (string, error) {
	return s.loginFn(ctx, username, password)
}
func (s *userUsecaseStub) GetProfile(ctx context.Context, id int) (*model.UserProfile, error) {
	return s.profileFn(ctx, id)
}
func (s *userUsecaseStub) UploadFotoProfil(ctx context.Context, id int, data []byte, name, contentType string) (string, error) {
	return s.uploadFn(ctx, id, data, name, contentType)
}
func (s *userUsecaseStub) UpdateProfileText(ctx context.Context, id int, name, phone, birth, address string) error {
	return s.updateProfileFn(ctx, id, name, phone, birth, address)
}
func (s *userUsecaseStub) GetAllStaff(ctx context.Context) ([]model.User, error) {
	return s.staffFn(ctx)
}
func (s *userUsecaseStub) DeleteUser(ctx context.Context, id int) error { return s.deleteFn(ctx, id) }
func (s *userUsecaseStub) UpdateUserByAdmin(ctx context.Context, user *model.User) error {
	return s.updateStaffFn(ctx, user)
}

func userRouter(stub *userUsecaseStub) *gin.Engine {
	gin.SetMode(gin.TestMode)
	handler := delivery.NewUserHandler(stub)
	router := gin.New()
	router.POST("/register", handler.Register)
	router.POST("/login", handler.Login)
	router.POST("/logout", handler.Logout)
	router.GET("/session", claimMiddleware(float64(4)), handler.Session)
	router.GET("/profile", claimMiddleware(float64(4)), handler.GetProfile)
	router.PUT("/profile", claimMiddleware(float64(4)), handler.UpdateProfile)
	router.POST("/profile/photo", claimMiddleware(float64(4)), handler.UploadFotoProfil)
	router.GET("/staff", handler.GetAllStaff)
	router.PUT("/staff/:id", handler.UpdateUserByAdmin)
	router.DELETE("/staff/:id", handler.DeleteUser)
	return router
}

func claimMiddleware(value any) gin.HandlerFunc {
	return func(c *gin.Context) { c.Set("id_user", value); c.Next() }
}

func userJSON(t *testing.T, router http.Handler, method, path string, payload any) *httptest.ResponseRecorder {
	t.Helper()
	var body bytes.Buffer
	if payload != nil {
		require.NoError(t, json.NewEncoder(&body).Encode(payload))
	}
	request := httptest.NewRequest(method, path, &body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	return response
}

func successfulUserStub(t *testing.T) *userUsecaseStub {
	t.Helper()
	t.Setenv("JWT_SECRET", "handler-test-secret")
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id_user": 4,
		"role":    model.RoleAdmin,
		"nama":    "Budi",
		"exp":     time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte("handler-test-secret"))
	require.NoError(t, err)

	return &userUsecaseStub{
		registerFn: func(_ context.Context, user *model.User) error {
			user.ID = 4
			assert.Equal(t, model.RoleMember, user.Role)
			return nil
		},
		loginFn: func(context.Context, string, string) (string, error) { return token, nil },
		profileFn: func(context.Context, int) (*model.UserProfile, error) {
			return &model.UserProfile{NamaLengkap: "Budi"}, nil
		},
		uploadFn: func(context.Context, int, []byte, string, string) (string, error) {
			return "https://example.test/photo.png", nil
		},
		updateProfileFn: func(context.Context, int, string, string, string, string) error { return nil },
		staffFn:         func(context.Context) ([]model.User, error) { return []model.User{{ID: 1, Role: model.RoleAdmin}}, nil },
		deleteFn:        func(context.Context, int) error { return nil },
		updateStaffFn:   func(context.Context, *model.User) error { return nil },
	}
}

func TestUserHandlerHappyPaths(t *testing.T) {
	router := userRouter(successfulUserStub(t))
	tests := []struct {
		method, path string
		body         any
		status       int
	}{
		{http.MethodPost, "/register", map[string]any{"nama_lengkap": "Budi", "email": "budi@example.com", "username": "budi@example.com", "no_telp": "0812", "password": "secret"}, http.StatusCreated},
		{http.MethodPost, "/login", map[string]any{"username": "budi@example.com", "password": "secret"}, http.StatusOK},
		{http.MethodGet, "/profile", nil, http.StatusOK},
		{http.MethodPut, "/profile", map[string]any{"nama_lengkap": "Budi", "no_telp": "0812"}, http.StatusOK},
		{http.MethodGet, "/staff", nil, http.StatusOK},
		{http.MethodPut, "/staff/3", map[string]any{"nama_lengkap": "Kasir", "role": "Kasir", "status": "Aktif"}, http.StatusOK},
		{http.MethodDelete, "/staff/3", nil, http.StatusOK},
	}
	for _, test := range tests {
		response := userJSON(t, router, test.method, test.path, test.body)
		assert.Equal(t, test.status, response.Code, "%s %s", test.method, test.path)
	}
}

func TestUserHandlerInvalidRequestsAndUsecaseErrors(t *testing.T) {
	backendError := errors.New("backend failed")
	stub := successfulUserStub(t)
	stub.registerFn = func(context.Context, *model.User) error { return backendError }
	stub.loginFn = func(context.Context, string, string) (string, error) { return "", backendError }
	stub.profileFn = func(context.Context, int) (*model.UserProfile, error) { return nil, backendError }
	stub.updateProfileFn = func(context.Context, int, string, string, string, string) error { return backendError }
	stub.staffFn = func(context.Context) ([]model.User, error) { return nil, backendError }
	stub.deleteFn = func(context.Context, int) error { return backendError }
	stub.updateStaffFn = func(context.Context, *model.User) error { return backendError }
	router := userRouter(stub)

	tests := []struct {
		method, path string
		body         any
		status       int
	}{
		{http.MethodPost, "/register", map[string]any{"nama_lengkap": "Budi", "email": "budi@example.com", "username": "budi@example.com", "no_telp": "0812", "password": "secret"}, http.StatusInternalServerError},
		{http.MethodPost, "/login", map[string]any{"username": "budi@example.com", "password": "bad"}, http.StatusUnauthorized},
		{http.MethodGet, "/profile", nil, http.StatusInternalServerError},
		{http.MethodPut, "/profile", map[string]any{"nama_lengkap": "Budi"}, http.StatusInternalServerError},
		{http.MethodGet, "/staff", nil, http.StatusInternalServerError},
		{http.MethodPut, "/staff/1", map[string]any{}, http.StatusInternalServerError},
		{http.MethodDelete, "/staff/1", nil, http.StatusInternalServerError},
		{http.MethodPut, "/staff/not-number", map[string]any{}, http.StatusBadRequest},
		{http.MethodDelete, "/staff/not-number", nil, http.StatusBadRequest},
	}
	for _, test := range tests {
		response := userJSON(t, router, test.method, test.path, test.body)
		assert.Equal(t, test.status, response.Code, "%s %s", test.method, test.path)
	}
}

func TestUserHandlerRejectsMissingOrMalformedClaims(t *testing.T) {
	stub := successfulUserStub(t)
	handler := delivery.NewUserHandler(stub)
	for _, test := range []struct {
		name   string
		value  any
		set    bool
		status int
	}{
		{name: "missing", status: http.StatusUnauthorized},
		{name: "wrong type", value: "4", set: true, status: http.StatusInternalServerError},
	} {
		t.Run(test.name, func(t *testing.T) {
			router := gin.New()
			router.GET("/profile", func(c *gin.Context) {
				if test.set {
					c.Set("id_user", test.value)
				}
				c.Next()
			}, handler.GetProfile)
			response := httptest.NewRecorder()
			router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/profile", nil))
			assert.Equal(t, test.status, response.Code)
		})
	}
}

func TestUserHandlerUploadPhoto(t *testing.T) {
	router := userRouter(successfulUserStub(t))
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("foto", "profile.png")
	require.NoError(t, err)
	_, err = part.Write([]byte("image"))
	require.NoError(t, err)
	require.NoError(t, writer.Close())
	request := httptest.NewRequest(http.MethodPost, "/profile/photo", &body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	assert.Equal(t, http.StatusOK, response.Code)

	response = userJSON(t, router, http.MethodPost, "/profile/photo", nil)
	assert.Equal(t, http.StatusBadRequest, response.Code)
}
