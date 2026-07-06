package observability

import (
	"io"
	"log/slog"
	"os"
	"strings"
)

func NewLogger(output io.Writer) *slog.Logger {
	level := slog.LevelInfo
	switch strings.ToLower(os.Getenv("LOG_LEVEL")) {
	case "debug":
		level = slog.LevelDebug
	case "warn":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	}

	return slog.New(slog.NewJSONHandler(output, &slog.HandlerOptions{Level: level}))
}
