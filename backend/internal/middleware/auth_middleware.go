package middleware

import (
	"net/http"

	"github.com/akuaruu/apomacy/backend/internal/auth"
	"github.com/gin-gonic/gin"
)

// RequireAuth mencegat request untuk memastikan user sudah login
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		// 1. Ekstrak token
		tokenString, err := auth.ExtractBearerToken(authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort() // WAJIB: Hentikan request agar tidak tembus ke Handler
			return
		}

		// 2. Validasi token
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau sudah expired"})
			c.Abort()
			return
		}

		// 3. Simpan data krusial ke Gin Context
		c.Set("id_user", claims["id_user"])
		c.Set("role", claims["role"])

		c.Next()
	}
}

// (Role-Based Access Control)
// Wajib dipanggil SETELAH RequireAuth()
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ambil role dari Gin Context yang sudah di-set oleh RequireAuth
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid"})
			c.Abort()
			return
		}

		// Cek apakah role user ada di dalam daftar yang diizinkan
		isAllowed := false
		for _, role := range allowedRoles {
			if userRole == role {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk mengakses resource ini"})
			c.Abort()
			return
		}

		c.Next()
	}
}
