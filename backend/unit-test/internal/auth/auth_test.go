package unittest

import (
	"testing"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/auth"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func signedToken(t *testing.T, secret string, claims jwt.MapClaims) string {
	t.Helper()
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	require.NoError(t, err)
	return token
}

func TestExtractBearerToken(t *testing.T) {
	tests := []struct {
		name, header, want, wantError string
	}{
		{name: "valid", header: "Bearer abc.def", want: "abc.def"},
		{name: "empty", wantError: "header authorization kosong"},
		{name: "wrong scheme", header: "Basic abc", wantError: "format token harus 'Bearer <token>'"},
		{name: "missing token", header: "Bearer", wantError: "format token harus 'Bearer <token>'"},
		{name: "extra segment", header: "Bearer one two", wantError: "format token harus 'Bearer <token>'"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := auth.ExtractBearerToken(test.header)
			if test.wantError != "" {
				require.EqualError(t, err, test.wantError)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, test.want, got)
		})
	}
}

func TestValidateToken(t *testing.T) {
	const secret = "test-secret"
	t.Setenv("JWT_SECRET", secret)

	t.Run("valid token", func(t *testing.T) {
		token := signedToken(t, secret, jwt.MapClaims{"id_user": 7, "role": "Admin", "exp": time.Now().Add(time.Hour).Unix()})
		claims, err := auth.ValidateToken(token)
		require.NoError(t, err)
		assert.Equal(t, float64(7), claims["id_user"])
	})

	t.Run("wrong signature", func(t *testing.T) {
		token := signedToken(t, "different-secret", jwt.MapClaims{"exp": time.Now().Add(time.Hour).Unix()})
		_, err := auth.ValidateToken(token)
		require.Error(t, err)
	})

	t.Run("expired", func(t *testing.T) {
		token := signedToken(t, secret, jwt.MapClaims{"exp": time.Now().Add(-time.Hour).Unix()})
		_, err := auth.ValidateToken(token)
		require.Error(t, err)
	})

	t.Run("rejects non HMAC algorithm", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodNone, jwt.MapClaims{"exp": time.Now().Add(time.Hour).Unix()})
		raw, err := token.SignedString(jwt.UnsafeAllowNoneSignatureType)
		require.NoError(t, err)
		_, err = auth.ValidateToken(raw)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "metode signing tidak valid")
	})
}
