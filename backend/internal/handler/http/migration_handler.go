package http

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MigrationHandler struct {
	db *pgxpool.Pool
}

func NewMigrationHandler(db *pgxpool.Pool) *MigrationHandler {
	return &MigrationHandler{db: db}
}

func (h *MigrationHandler) RunImageMigration(c *gin.Context) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	supabaseBucket := os.Getenv("SUPABASE_BUCKET")

	if supabaseURL == "" || supabaseKey == "" || supabaseBucket == "" {
		c.JSON(500, gin.H{"error": "Kredensial .env kosong!"})
		return
	}

	ctx := context.Background()
	querySelect := `SELECT id_obat, kode_obat, gambar_produk FROM obat 
					WHERE gambar_produk LIKE 'http%' 
					AND gambar_produk NOT LIKE '%supabase.co%'`

	rows, err := h.db.Query(ctx, querySelect)
	if err != nil {
		c.JSON(500, gin.H{"error": "Gagal query database", "detail": err.Error()})
		return
	}
	defer rows.Close()

	var migratedCount int
	var failedList []string

	for rows.Next() {
		var idObat int
		var kodeObat, oldURL string
		rows.Scan(&idObat, &kodeObat, &oldURL)

		// ---------------------------------------------------------
		// TAHAP 1: DOWNLOAD DENGAN PENYAMARAN BROWSER
		// ---------------------------------------------------------
		reqDL, err := http.NewRequest("GET", oldURL, nil)
		if err != nil {
			failedList = append(failedList, fmt.Sprintf("%s (Gagal Init Req)", kodeObat))
			continue
		}

		// Menyamar menjadi Google Chrome untuk menembus proteksi Cloudflare/Alodokter
		reqDL.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
		reqDL.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")

		clientDL := &http.Client{Timeout: 15 * time.Second}
		resp, err := clientDL.Do(reqDL)

		if err != nil {
			slog.ErrorContext(c.Request.Context(), "image migration download failed", "medicine_code", kodeObat, "error", err, "request_id", requestID(c))
			failedList = append(failedList, fmt.Sprintf("%s (Gagal Request DL)", kodeObat))
			continue
		}

		if resp.StatusCode != http.StatusOK {
			slog.WarnContext(c.Request.Context(), "image migration source rejected request", "medicine_code", kodeObat, "status", resp.StatusCode, "request_id", requestID(c))
			failedList = append(failedList, fmt.Sprintf("%s (Ditolak Web: %d)", kodeObat, resp.StatusCode))
			resp.Body.Close()
			continue
		}

		imageBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		slog.DebugContext(c.Request.Context(), "image migration download completed", "medicine_code", kodeObat, "request_id", requestID(c))

		// ---------------------------------------------------------
		// TAHAP 2: UPLOAD KE SUPABASE
		// ---------------------------------------------------------
		fileName := fmt.Sprintf("OBT-ID%d-%d.jpg", idObat, time.Now().UnixNano())
		uploadURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseURL, supabaseBucket, fileName)

		reqUP, _ := http.NewRequest("POST", uploadURL, bytes.NewReader(imageBytes))
		reqUP.Header.Set("Authorization", "Bearer "+supabaseKey)
		reqUP.Header.Set("Content-Type", "image/jpeg")

		clientUP := &http.Client{Timeout: 15 * time.Second}
		upResp, upErr := clientUP.Do(reqUP)

		if upErr != nil || upResp.StatusCode >= 400 {
			status := 0
			if upResp != nil {
				status = upResp.StatusCode
				upResp.Body.Close()
			}
			slog.ErrorContext(c.Request.Context(), "image migration upload failed", "medicine_code", kodeObat, "status", status, "error", upErr, "request_id", requestID(c))
			failedList = append(failedList, fmt.Sprintf("%s (Gagal Upload Supabase: %d)", kodeObat, status))
			continue
		}
		upResp.Body.Close()
		slog.DebugContext(c.Request.Context(), "image migration upload completed", "medicine_code", kodeObat, "request_id", requestID(c))

		// ---------------------------------------------------------
		// TAHAP 3: UPDATE DATABASE
		// ---------------------------------------------------------
		newPublicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseURL, supabaseBucket, fileName)
		_, dbErr := h.db.Exec(ctx, `UPDATE obat SET gambar_produk = $1 WHERE id_obat = $2`, newPublicURL, idObat)

		if dbErr != nil {
			slog.ErrorContext(c.Request.Context(), "image migration database update failed", "medicine_code", kodeObat, "error", dbErr, "request_id", requestID(c))
			failedList = append(failedList, fmt.Sprintf("%s (Gagal Update DB)", kodeObat))
			continue
		}

		slog.InfoContext(c.Request.Context(), "image migration item completed", "medicine_code", kodeObat, "request_id", requestID(c))
		migratedCount++
	}

	c.JSON(200, gin.H{
		"message":        "Migrasi Selesai",
		"total_berhasil": migratedCount,
		"gagal":          failedList,
	})
}
