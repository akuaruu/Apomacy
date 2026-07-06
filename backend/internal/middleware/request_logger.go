package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

const RequestIDKey = "request_id"

func RequestLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" || len(requestID) > 128 {
			requestID = newRequestID()
		}

		c.Set(RequestIDKey, requestID)
		c.Header("X-Request-ID", requestID)
		startedAt := time.Now()

		c.Next()

		attributes := []any{
			"request_id", requestID,
			"method", c.Request.Method,
			"path", c.FullPath(),
			"status", c.Writer.Status(),
			"response_bytes", c.Writer.Size(),
			"duration_ms", time.Since(startedAt).Milliseconds(),
			"client_ip", c.ClientIP(),
		}
		if userID, exists := c.Get("id_user"); exists {
			attributes = append(attributes, "user_id", userID)
		}

		if c.Writer.Status() >= 500 {
			logger.ErrorContext(c.Request.Context(), "http request completed", attributes...)
			return
		}
		logger.InfoContext(c.Request.Context(), "http request completed", attributes...)
	}
}

func newRequestID() string {
	buffer := make([]byte, 16)
	if _, err := rand.Read(buffer); err != nil {
		return time.Now().UTC().Format("20060102T150405.000000000")
	}
	return hex.EncodeToString(buffer)
}
