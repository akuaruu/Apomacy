package unittest

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/akuaruu/apomacy/backend/internal/observability"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewLoggerUsesJSONAndConfiguredLevel(t *testing.T) {
	var output bytes.Buffer
	t.Setenv("LOG_LEVEL", "warn")
	logger := observability.NewLogger(&output)
	logger.Info("hidden")
	assert.Empty(t, output.String())
	logger.Warn("database pool nearing capacity", "open_connections", 14)

	var entry map[string]any
	require.NoError(t, json.Unmarshal(output.Bytes(), &entry))
	assert.Equal(t, "WARN", entry["level"])
	assert.Equal(t, "database pool nearing capacity", entry["msg"])
	assert.Equal(t, float64(14), entry["open_connections"])
}
