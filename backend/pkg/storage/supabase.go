package storage

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// UploadToSupabase menerima file dari Gin dan mengunggahnya ke Supabase Storage
func UploadToSupabase(file *multipart.FileHeader) (string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	bucketName := "obat_images"

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// nama file unik
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)

	// Bentuk URL endpoint API Supabase Storage
	uploadURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseURL, bucketName, filename)

	req, err := http.NewRequest("POST", uploadURL, src)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", file.Header.Get("Content-Type"))

	// Eksekusi Request
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("gagal upload ke supabase: status %d", resp.StatusCode)
	}

	// Kembalikan URL publik agar bisa disimpan ke database PostgreSQL
	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseURL, bucketName, filename)
	return publicURL, nil
}
