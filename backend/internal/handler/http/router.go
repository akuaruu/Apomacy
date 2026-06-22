package http

import (
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

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://apomacy.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	userRepo := repository.NewUserRepository(dbPool)
	userUsecase := usecase.NewUserUsecase(userRepo)
	userHandler := NewUserHandler(userUsecase)

	obatRepo := repository.NewObatRepository(dbPool)
	obatUsecase := usecase.NewObatUsecase(obatRepo)
	obatHandler := NewObatHandler(obatUsecase)

	customerRepo := repository.NewCustomerRepository(dbPool)
	customerUsecase := usecase.NewCustomerUsecase(customerRepo)
	customerHandler := NewCustomerHandler(customerUsecase)

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

	api := r.Group("/api")
	{
		publicUsers := api.Group("/users")
		{
			publicUsers.POST("/register", userHandler.Register)
			publicUsers.POST("/login", userHandler.Login)
		}

		protectedUsers := api.Group("/users")
		protectedUsers.Use(middleware.RequireAuth())
		{
			protectedUsers.PUT("/foto", userHandler.UploadFotoProfil)
			protectedUsers.PUT("/profile", userHandler.UpdateProfile)
			protectedUsers.GET("/profile", userHandler.GetProfile)
		}

		obat := api.Group("/obat")
		{
			obat.POST("", obatHandler.CreateObat)
			obat.GET("", obatHandler.GetAllObat)
			obat.GET("/:id", obatHandler.GetObatByID)
			obat.PUT("/:id", obatHandler.UpdateObat)
			obat.DELETE("/:id", obatHandler.DeleteObat)
		}

		customer := api.Group("/customer")
		{
			customer.POST("", customerHandler.CreateCustomer)
			customer.GET("", customerHandler.GetAllCustomers)
			customer.GET("/:id", customerHandler.GetCustomerByID)
			customer.PUT("/:id", customerHandler.UpdateCustomer)
			customer.DELETE("/:id", customerHandler.DeleteCustomer)
		}

		supplier := api.Group("/supplier")
		{
			supplier.POST("", supplierHandler.CreateSupplier)
			supplier.GET("", supplierHandler.GetAllSuppliers)
			supplier.GET("/:id", supplierHandler.GetSupplierByID)
			supplier.PUT("/:id", supplierHandler.UpdateSupplier)
			supplier.DELETE("/:id", supplierHandler.DeleteSupplier)
		}

		// Endpoint yang boleh diakses semua role terautentikasi (customer, kasir, admin)
		transaksi := api.Group("/transaksi")
		transaksi.Use(middleware.RequireAuth())
		{
			transaksi.POST("", transaksiHandler.Checkout)
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
			payment.POST("", paymentHandler.Checkout)
			payment.POST("/notification", paymentHandler.WebhookNotification)
		}

		api.POST("/restock", restockHandler.CreateRestock)
		api.GET("/migrate-images", migrationHandler.RunImageMigration)
	}

	return r
}
