package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/config"
	router "github.com/akuaruu/apomacy/backend/internal/handler/http"
	"github.com/akuaruu/apomacy/backend/pkg/database"
	midtrans "github.com/akuaruu/apomacy/backend/pkg/transaction"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Load Configurations & Infrastructures
	godotenv.Load()
	cfg := config.LoadConfig()

	dbPool := database.NewPostgresConn(&cfg.DB)
	defer dbPool.Close()

	midtrans.Init()

	// 2. Setup Router (Injeksi dependensi dilakukan di sini)
	engine := router.SetupRouter(dbPool)

	// 3. Konfigurasi HTTP Server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: engine,

		// Pencegahan serangan Slowloris (Timeout Security)
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// 4. Jalankan Server di dalam Goroutine
	go func() {
		log.Printf("Server Apomacy berjalan di port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server error: %s\n", err)
		}
	}()

	// 5. Graceful Shutdown (Standar Global)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Mematikan server secara aman...")

	// Memberikan waktu toleransi 5 detik untuk menyelesaikan request yang sedang berjalan
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server dipaksa mati: ", err)
	}

	log.Println("Server berhasil dimatikan dengan aman.")
}
