package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type idempotencyEntry struct {
	expiresAt time.Time
	inFlight  bool
}

func IdempotencyGuard(ttl time.Duration) gin.HandlerFunc {
	if ttl <= 0 {
		ttl = 10 * time.Minute
	}

	var (
		mu          sync.Mutex
		entries     = make(map[string]idempotencyEntry)
		lastCleanup time.Time
	)

	return func(c *gin.Context) {
		key := c.GetHeader("Idempotency-Key")
		if key == "" {
			c.Next()
			return
		}

		now := time.Now()
		scope := idempotencyScope(c, key)

		mu.Lock()
		if now.Sub(lastCleanup) >= ttl {
			for existingKey, entry := range entries {
				if now.After(entry.expiresAt) {
					delete(entries, existingKey)
				}
			}
			lastCleanup = now
		}

		if entry, exists := entries[scope]; exists && now.Before(entry.expiresAt) {
			mu.Unlock()
			c.AbortWithStatusJSON(http.StatusConflict, gin.H{
				"error": "Permintaan checkout sedang atau sudah diproses.",
			})
			return
		}

		entries[scope] = idempotencyEntry{expiresAt: now.Add(ttl), inFlight: true}
		mu.Unlock()

		c.Next()

		if c.Writer.Status() >= http.StatusBadRequest {
			mu.Lock()
			delete(entries, scope)
			mu.Unlock()
			return
		}

		mu.Lock()
		entry := entries[scope]
		entry.inFlight = false
		entry.expiresAt = time.Now().Add(ttl)
		entries[scope] = entry
		mu.Unlock()
	}
}

func idempotencyScope(c *gin.Context, key string) string {
	path := c.FullPath()
	if path == "" {
		path = c.Request.URL.Path
	}

	userID := "anonymous"
	if value, exists := c.Get("id_user"); exists {
		switch id := value.(type) {
		case int:
			userID = strconv.Itoa(id)
		case int64:
			userID = strconv.FormatInt(id, 10)
		case float64:
			userID = strconv.Itoa(int(id))
		}
	}

	return userID + ":" + c.Request.Method + ":" + path + ":" + key
}
