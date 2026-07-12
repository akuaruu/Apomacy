package http

import (
	"log/slog"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/middleware"
	"github.com/akuaruu/apomacy/backend/internal/repository"
	"github.com/akuaruu/apomacy/backend/internal/usecase"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupRouter(dbPool *pgxpool.Pool) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()
	r.Use(gin.Recovery(), middleware.RequestLogger(slog.Default()))

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://apomacy.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Idempotency-Key"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	userRepo := repository.NewUserRepository(dbPool)
	customerRepo := repository.NewCustomerRepository(dbPool)

	userUsecase := usecase.NewUserUsecase(userRepo, customerRepo)
	userHandler := NewUserHandler(userUsecase)

	customerUsecase := usecase.NewCustomerUsecase(customerRepo)
	customerHandler := NewCustomerHandler(customerUsecase)

	obatRepo := repository.NewObatRepository(dbPool)
	obatUsecase := usecase.NewObatUsecase(obatRepo)
	obatHandler := NewObatHandler(obatUsecase)

	restockRepo := repository.NewRestockRepository(dbPool)
	restockUsecase := usecase.NewRestockUsecase(restockRepo)
	restockHandler := NewRestockHandler(restockUsecase)

	supplierRepo := repository.NewSupplierRepository(dbPool)
	supplierUsecase := usecase.NewSupplierUsecase(supplierRepo)
	supplierHandler := NewSupplierHandler(supplierUsecase)

	transaksiRepo := repository.NewTransaksiRepository(dbPool)
	transaksiUsecase := usecase.NewTransaksiUsecase(transaksiRepo)
	transaksiHandler := NewTransaksiHandler(transaksiUsecase)

	paymentUsecase := usecase.NewPaymentUsecase()
	paymentHandler := NewPaymentHandler(paymentUsecase, transaksiUsecase)

	migrationHandler := NewMigrationHandler(dbPool)

	authLimiter := middleware.RateLimiter(middleware.RateLimitConfig{Limit: 5, Window: time.Minute})
	uploadLimiter := middleware.RateLimiter(middleware.RateLimitConfig{Limit: 10, Window: time.Minute})
	checkoutLimiter := middleware.RateLimiter(middleware.RateLimitConfig{Limit: 20, Window: time.Minute})
	migrationLimiter := middleware.RateLimiter(middleware.RateLimitConfig{Limit: 1, Window: time.Hour})
	checkoutIdempotency := middleware.IdempotencyGuard(10 * time.Minute)

	api := r.Group("/api")
	{
		publicUsers := api.Group("/users")
		{
			publicUsers.POST("/register", authLimiter, userHandler.Register)
			publicUsers.POST("/login", authLimiter, userHandler.Login)
			publicUsers.POST("/logout", userHandler.Logout)
		}

		protectedUsers := api.Group("/users")
		protectedUsers.Use(middleware.RequireAuth())
		{
			protectedUsers.GET("/session", userHandler.Session)
			protectedUsers.PUT("/foto", uploadLimiter, userHandler.UploadFotoProfil)
			protectedUsers.PUT("/profile", userHandler.UpdateProfile)
			protectedUsers.GET("/profile", userHandler.GetProfile)
		}

		obat := api.Group("/obat")
		{
			obat.GET("", obatHandler.GetAllObat)
			obat.GET("/:id", obatHandler.GetObatByID)
			obatStaff := obat.Group("")
			obatStaff.Use(middleware.RequireAuth(), middleware.RequireRole("Admin"))
			{
				obatStaff.POST("", obatHandler.CreateObat)
				obatStaff.PUT("/:id", obatHandler.UpdateObat)
				obatStaff.DELETE("/:id", obatHandler.DeleteObat)
			}
		}

		customer := api.Group("/customer")
		customer.Use(middleware.RequireAuth(), middleware.RequireRole("Kasir", "Admin"))
		{
			customer.POST("", customerHandler.CreateCustomer)
			customer.GET("", customerHandler.GetAllCustomers)
			customer.GET("/:id", customerHandler.GetCustomerByID)
			customer.PUT("/:id", customerHandler.UpdateCustomer)

			customerAdmin := customer.Group("")
			customerAdmin.Use(middleware.RequireRole("Admin"))
			{
				customerAdmin.DELETE("/:id", customerHandler.DeleteCustomer)
			}
		}

		supplier := api.Group("/supplier")
		supplier.Use(middleware.RequireAuth(), middleware.RequireRole("Kasir", "Admin"))
		{
			supplier.GET("", supplierHandler.GetAllSuppliers)
			supplier.GET("/:id", supplierHandler.GetSupplierByID)

			supplierAdmin := supplier.Group("")
			supplierAdmin.Use(middleware.RequireRole("Admin"))
			{
				supplierAdmin.POST("", supplierHandler.CreateSupplier)
				supplierAdmin.PUT("/:id", supplierHandler.UpdateSupplier)
				supplierAdmin.DELETE("/:id", supplierHandler.DeleteSupplier)
			}
		}

		// Endpoint yang boleh diakses semua role terautentikasi (customer, kasir, admin)
		transaksi := api.Group("/transaksi")
		transaksi.Use(middleware.RequireAuth())
		{
			transaksi.POST("", checkoutLimiter, checkoutIdempotency, transaksiHandler.Checkout)
			transaksi.GET("/:id", transaksiHandler.GetDetail)
			transaksi.GET("", transaksiHandler.GetRiwayatUser)
		}

		// Endpoint khusus staff (kasir/admin) untuk operasional toko
		transaksiStaff := api.Group("/transaksi")
		transaksiStaff.Use(middleware.RequireAuth(), middleware.RequireRole("Kasir", "Admin"))
		{
			transaksiStaff.PUT("/:id/batal", transaksiHandler.Batalkan)
			transaksiStaff.PATCH("/:id/status-pesanan", transaksiHandler.UpdateStatusPesanan)
			transaksiStaff.GET("/all", transaksiHandler.GetAll)
		}

		payment := api.Group("/checkout")
		{
			payment.POST("", middleware.RequireAuth(), checkoutLimiter, checkoutIdempotency, paymentHandler.Checkout)
			payment.POST("/notification", paymentHandler.WebhookNotification)
		}
		api.POST("/restock", middleware.RequireAuth(), middleware.RequireRole("Admin"), restockHandler.CreateRestock)
		api.GET("/migrate-images", middleware.RequireAuth(), middleware.RequireRole("Admin"), migrationLimiter, migrationHandler.RunImageMigration)
		api.POST("/migrate-images", middleware.RequireAuth(), middleware.RequireRole("Admin"), migrationLimiter, migrationHandler.RunImageMigration)

		// Endpoint khusus Admin untuk manajemen karyawan (staff)
		adminUsers := api.Group("/users")
		adminUsers.Use(middleware.RequireAuth(), middleware.RequireRole("Admin"))
		{
			adminUsers.GET("/staff", userHandler.GetAllStaff)
			adminUsers.PUT("/staff/:id", userHandler.UpdateUserByAdmin)
			adminUsers.DELETE("/staff/:id", userHandler.DeleteUser)
		}
	}

	return r

}
