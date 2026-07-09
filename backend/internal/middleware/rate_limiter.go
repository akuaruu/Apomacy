package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type RateLimitConfig struct {
	Limit  int
	Window time.Duration
}

type rateLimitEntry struct {
	count   int
	resetAt time.Time
}

func RateLimiter(config RateLimitConfig) gin.HandlerFunc {
	if config.Limit <= 0 || config.Window <= 0 {
		return func(c *gin.Context) {
			c.Next()
		}
	}

	var (
		mu          sync.Mutex
		entries     = make(map[string]rateLimitEntry)
		lastCleanup time.Time
	)

	return func(c *gin.Context) {
		now := time.Now()
		key := rateLimitKey(c)

		mu.Lock()
		if now.Sub(lastCleanup) >= config.Window {
			for existingKey, existingEntry := range entries {
				if now.After(existingEntry.resetAt) {
					delete(entries, existingKey)
				}
			}
			lastCleanup = now
		}

		entry, exists := entries[key]
		if !exists || now.After(entry.resetAt) {
			entry = rateLimitEntry{
				count:   0,
				resetAt: now.Add(config.Window),
			}
		}

		entry.count++
		entries[key] = entry

		remaining := config.Limit - entry.count
		if remaining < 0 {
			remaining = 0
		}

		retryAfter := int(time.Until(entry.resetAt).Seconds())
		if retryAfter < 1 {
			retryAfter = 1
		}

		limited := entry.count > config.Limit
		mu.Unlock()

		c.Header("X-RateLimit-Limit", strconv.Itoa(config.Limit))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(entry.resetAt.Unix(), 10))

		if limited {
			c.Header("Retry-After", strconv.Itoa(retryAfter))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Terlalu banyak permintaan. Silakan coba lagi nanti.",
			})
			return
		}

		c.Next()
	}
}

func rateLimitKey(c *gin.Context) string {
	path := c.FullPath()
	if path == "" {
		path = c.Request.URL.Path
	}
	return c.ClientIP() + ":" + c.Request.Method + ":" + path
}
