package database

import (
	"context"
	"fmt"
	"log"

	"github.com/akuaruu/apomacy/backend/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPostgresConn(cfg *config.DBConfig) *pgxpool.Pool {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name,
	)

	poolConfig, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("Gagal parsing config DB: %v", err)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		log.Fatalf("Gagal terhubung ke DB: %v", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Database tidak merespon: %v", err)
	}

	log.Println("PostgreSQL berhasil terhubung!")
	return pool
}
