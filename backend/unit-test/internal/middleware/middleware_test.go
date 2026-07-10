package unittest

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func middlewareToken(t *testing.T, secret, role string) string {
	t.Helper()
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id_user": 9, "role": role, "exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(secret))
	require.NoError(t, err)
	return token
}

func TestRequireAuth(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("JWT_SECRET", "middleware-secret")
	router := gin.New()
	router.GET("/private", middleware.RequireAuth(), func(c *gin.Context) {
		id, _ := c.Get("id_user")
		role, _ := c.Get("role")
		c.JSON(http.StatusOK, gin.H{"id": id, "role": role})
	})

	tests := []struct {
		name, authorization string
		status              int
	}{
		{name: "missing header", status: http.StatusUnauthorized},
		{name: "malformed header", authorization: "Basic token", status: http.StatusUnauthorized},
		{name: "invalid token", authorization: "Bearer invalid", status: http.StatusUnauthorized},
		{name: "valid", authorization: "Bearer " + middlewareToken(t, "middleware-secret", "Admin"), status: http.StatusOK},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodGet, "/private", nil)
			request.Header.Set("Authorization", test.authorization)
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)
			assert.Equal(t, test.status, response.Code)
			if test.status == http.StatusOK {
				assert.Contains(t, response.Body.String(), `"role":"Admin"`)
			}
		})
	}
}

func TestRequireAuthAcceptsHttpOnlyCookieToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("JWT_SECRET", "middleware-secret")
	router := gin.New()
	router.GET("/private", middleware.RequireAuth(), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	request := httptest.NewRequest(http.MethodGet, "/private", nil)
	request.AddCookie(&http.Cookie{
		Name:  "apomacy_token",
		Value: middlewareToken(t, "middleware-secret", "Member"),
	})
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusNoContent, response.Code)
}

func TestRequireRole(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tests := []struct {
		name       string
		setRole    bool
		role       string
		wantStatus int
	}{
		{name: "missing role", wantStatus: http.StatusUnauthorized},
		{name: "forbidden role", setRole: true, role: "Member", wantStatus: http.StatusForbidden},
		{name: "allowed role", setRole: true, role: "Admin", wantStatus: http.StatusNoContent},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			router := gin.New()
			router.GET("/admin", func(c *gin.Context) {
				if test.setRole {
					c.Set("role", test.role)
				}
				c.Next()
			}, middleware.RequireRole("Admin", "Kasir"), func(c *gin.Context) { c.Status(http.StatusNoContent) })
			response := httptest.NewRecorder()
			router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/admin", nil))
			assert.Equal(t, test.wantStatus, response.Code)
		})
	}
}

func TestRequestLogger(t *testing.T) {
	gin.SetMode(gin.TestMode)
	var output bytes.Buffer
	logger := slog.New(slog.NewJSONHandler(&output, nil))
	router := gin.New()
	router.Use(middleware.RequestLogger(logger))
	router.GET("/health", func(c *gin.Context) { c.JSON(http.StatusServiceUnavailable, gin.H{"error": "down"}) })

	request := httptest.NewRequest(http.MethodGet, "/health?full=true", nil)
	request.Header.Set("X-Request-ID", "trace-123")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)

	assert.Equal(t, "trace-123", response.Header().Get("X-Request-ID"))
	var entry map[string]any
	require.NoError(t, json.Unmarshal(output.Bytes(), &entry))
	assert.Equal(t, "ERROR", entry["level"])
	assert.Equal(t, "trace-123", entry["request_id"])
	assert.Equal(t, float64(http.StatusServiceUnavailable), entry["status"])
}

func TestRequestLoggerGeneratesRequestID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(middleware.RequestLogger(slog.New(slog.NewJSONHandler(&bytes.Buffer{}, nil))))
	router.GET("/", func(c *gin.Context) { c.Status(http.StatusNoContent) })
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))
	assert.Len(t, response.Header().Get("X-Request-ID"), 32)
}

func TestRateLimiterAllowsUntilLimit(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/login", middleware.RateLimiter(middleware.RateLimitConfig{
		Limit:  2,
		Window: time.Minute,
	}), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	for range 2 {
		response := httptest.NewRecorder()
		router.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/login", nil))
		assert.Equal(t, http.StatusNoContent, response.Code)
		assert.Equal(t, "2", response.Header().Get("X-RateLimit-Limit"))
	}

	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/login", nil))

	assert.Equal(t, http.StatusTooManyRequests, response.Code)
	assert.Equal(t, "0", response.Header().Get("X-RateLimit-Remaining"))
	assert.NotEmpty(t, response.Header().Get("Retry-After"))
	assert.Contains(t, response.Body.String(), "Terlalu banyak permintaan")
}

func TestRateLimiterSeparatesRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	limiter := middleware.RateLimiter(middleware.RateLimitConfig{
		Limit:  1,
		Window: time.Minute,
	})
	router := gin.New()
	router.POST("/login", limiter, func(c *gin.Context) { c.Status(http.StatusNoContent) })
	router.POST("/register", limiter, func(c *gin.Context) { c.Status(http.StatusCreated) })

	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/login", nil))
	assert.Equal(t, http.StatusNoContent, response.Code)

	response = httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/register", nil))
	assert.Equal(t, http.StatusCreated, response.Code)
}

func TestRateLimiterResetsAfterWindow(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/limited", middleware.RateLimiter(middleware.RateLimitConfig{
		Limit:  1,
		Window: 10 * time.Millisecond,
	}), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/limited", nil))
	assert.Equal(t, http.StatusNoContent, response.Code)

	response = httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/limited", nil))
	assert.Equal(t, http.StatusTooManyRequests, response.Code)

	time.Sleep(15 * time.Millisecond)

	response = httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/limited", nil))
	assert.Equal(t, http.StatusNoContent, response.Code)
}
