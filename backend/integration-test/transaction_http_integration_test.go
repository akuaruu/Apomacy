//go:build integration

package integrationtest

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	delivery "github.com/akuaruu/apomacy/backend/internal/handler/http"
	"github.com/akuaruu/apomacy/backend/internal/middleware"
	"github.com/akuaruu/apomacy/backend/internal/repository"
	"github.com/akuaruu/apomacy/backend/internal/usecase"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func integrationDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is not set; integration test requires disposable PostgreSQL")
	}
	config, err := pgxpool.ParseConfig(databaseURL)
	require.NoError(t, err)
	config.MaxConns = 1
	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	require.NoError(t, err)
	t.Cleanup(pool.Close)

	statements := []string{
		`CREATE TEMP TABLE obat (id_obat integer PRIMARY KEY, stok integer NOT NULL)`,
		`CREATE TEMP TABLE transaksi (
			id_transaksi bigserial PRIMARY KEY, id_customer integer, id_user integer NOT NULL,
			no_transaksi text NOT NULL UNIQUE, tanggal_transaksi timestamptz NOT NULL,
			nama_customer text, total_item integer NOT NULL, subtotal numeric NOT NULL,
			total_bayar numeric NOT NULL, metode_pembayaran text NOT NULL,
			resep_required boolean NOT NULL, no_resep text, status text NOT NULL,
			status_pesanan text NOT NULL
		)`,
		`CREATE TEMP TABLE detail_transaksi (
			id_detail_trx bigserial PRIMARY KEY, id_transaksi bigint NOT NULL,
			id_obat integer NOT NULL, nama_obat text NOT NULL, harga_satuan numeric NOT NULL,
			qty integer NOT NULL, subtotal numeric NOT NULL
		)`,
		`CREATE TEMP TABLE transaksi_pengiriman (
			id_pengiriman bigserial PRIMARY KEY, id_transaksi bigint NOT NULL,
			metode_penerimaan text NOT NULL, nama_penerima text, no_hp_penerima text,
			alamat_pengiriman text, waktu_pesanan_sampai timestamptz
		)`,
		`INSERT INTO obat (id_obat, stok) VALUES (1, 10)`,
	}
	for _, statement := range statements {
		_, err = pool.Exec(context.Background(), statement)
		require.NoError(t, err)
	}
	return pool
}

func integrationToken(t *testing.T, secret string) string {
	t.Helper()
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id_user": 42, "role": "Member", "exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(secret))
	require.NoError(t, err)
	return token
}

func checkoutRequest(t *testing.T, router http.Handler, token, orderID string, quantity int) *httptest.ResponseRecorder {
	t.Helper()
	payload := map[string]any{
		"no_transaksi": orderID, "total_item": quantity, "subtotal": 20000,
		"total_bayar": 20000, "metode_pembayaran": "QRIS", "resep_required": false,
		"details": []map[string]any{{"id_obat": 1, "nama_obat": "Paracetamol", "harga_satuan": 10000, "qty": quantity, "subtotal": 20000}},
	}
	var body bytes.Buffer
	require.NoError(t, json.NewEncoder(&body).Encode(payload))
	request := httptest.NewRequest(http.MethodPost, "/transactions", &body)
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	return response
}

func TestCheckoutHTTPWithPostgreSQL(t *testing.T) {
	pool := integrationDatabase(t)
	const secret = "integration-secret"
	t.Setenv("JWT_SECRET", secret)
	gin.SetMode(gin.TestMode)
	handler := delivery.NewTransaksiHandler(usecase.NewTransaksiUsecase(repository.NewTransaksiRepository(pool)))
	router := gin.New()
	router.POST("/transactions", middleware.RequireAuth(), handler.Checkout)
	token := integrationToken(t, secret)

	response := checkoutRequest(t, router, token, "TRX-INTEGRATION-1", 2)
	require.Equal(t, http.StatusCreated, response.Code, response.Body.String())
	var stock, transactionCount, detailCount int
	require.NoError(t, pool.QueryRow(context.Background(), `SELECT stok FROM obat WHERE id_obat = 1`).Scan(&stock))
	require.NoError(t, pool.QueryRow(context.Background(), `SELECT count(*) FROM transaksi`).Scan(&transactionCount))
	require.NoError(t, pool.QueryRow(context.Background(), `SELECT count(*) FROM detail_transaksi`).Scan(&detailCount))
	assert.Equal(t, 8, stock)
	assert.Equal(t, 1, transactionCount)
	assert.Equal(t, 1, detailCount)

	response = checkoutRequest(t, router, token, "TRX-INTEGRATION-2", 20)
	require.Equal(t, http.StatusInternalServerError, response.Code)
	require.NoError(t, pool.QueryRow(context.Background(), `SELECT stok FROM obat WHERE id_obat = 1`).Scan(&stock))
	require.NoError(t, pool.QueryRow(context.Background(), `SELECT count(*) FROM transaksi`).Scan(&transactionCount))
	assert.Equal(t, 8, stock)
	assert.Equal(t, 1, transactionCount, "failed checkout must roll back transaction and detail inserts")
}
