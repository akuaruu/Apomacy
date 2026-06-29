package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPostgresConn(cfg *config.DBConfig) *pgxpool.Pool {
	// 1. Merakit DSN (Data Source Name) dengan format URL
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=require",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name,
	)

	// 2. Parsing konfigurasi
	poolConfig, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("Gagal melakukan parsing config database: %v", err)
	}

	// 3. Optimasi Pooler untuk Supabase Cloud
	poolConfig.MaxConns = 15                      // Batas maksimal koneksi bersamaan
	poolConfig.MinConns = 2                       // Minimal koneksi yang selalu standby
	poolConfig.MaxConnLifetime = 30 * time.Minute // Tutup koneksi jika sudah terlalu lama
	poolConfig.MaxConnIdleTime = 5 * time.Minute  // Tutup koneksi jika menganggur

	// 4. Membuka koneksi
	dbPool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}

	// 5. Test Ping untuk memastikan kredensial benar
	if err := dbPool.Ping(context.Background()); err != nil {
		log.Fatalf("Database tidak merespons (Cek Password/Host di .env): %v", err)
	}

	log.Println("PostgreSQL (Supabase) berhasil terhubung!")
	return dbPool
}
