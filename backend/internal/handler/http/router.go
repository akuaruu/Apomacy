package http

import (
	"fmt"
	"strings"
	"time"

	"github.com/akuaruu/apomacy/backend/internal/repository"
	"github.com/akuaruu/apomacy/backend/internal/usecase"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/jackc/pgx/v5/pgxpool"
)

// SetupRouter adalah satu-satunya tempat untuk Dependency Injection dan Routing
func SetupRouter(dbPool *pgxpool.Pool) *gin.Engine {
	// Set Gin ke mode release untuk production
	// gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	// 1. Global Middleware
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Izinkan semua subdomain vercel.app milik project apomacy
			return origin == "https://apomacy.vercel.app" ||
				strings.HasSuffix(origin, "-aruu.vercel.app") ||
				origin == "http://localhost:3000" ||
				origin == "http://localhost:5173"
		},

		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 2. Dependency Injection Setup
	// Domain: User
	userRepo := repository.NewUserRepository(dbPool)
	userUsecase := usecase.NewUserUsecase(userRepo)
	userHandler := NewUserHandler(userUsecase)

	// Domain: Obat
	obatRepo := repository.NewObatRepository(dbPool)
	obatUsecase := usecase.NewObatUsecase(obatRepo)
	obatHandler := NewObatHandler(obatUsecase)

	// Domain: Customer
	// Catatan: Pastikan CustomerRepository dan CustomerUsecase sudah kamu buat ya!
	customerRepo := repository.NewCustomerRepository(dbPool)
	customerUsecase := usecase.NewCustomerUsecase(customerRepo)
	customerHandler := NewCustomerHandler(customerUsecase)

	//Domain: Restock
	restockRepo := repository.NewRestockRepository(dbPool)
	restockUsecase := usecase.NewRestockUsecase(restockRepo)
	restockHandler := NewRestockHandler(restockUsecase)

	//Domain Supplier
	supplierRepo := repository.NewSupplierRepository(dbPool)
	supplierUsecase := usecase.NewSupplierUsecase(supplierRepo)
	supplierHandler := NewSupplierHandler(supplierUsecase)

	// Domain: payment
	paymentUsecase := usecase.NewPaymentUsecase()
	paymentHandler := NewPaymentHandler(paymentUsecase)

	//Domain: transaksi
	transaksiRepo := repository.NewTransaksiRepository(dbPool)
	transaksiUsecase := usecase.NewTransaksiUsecase(transaksiRepo)
	transaksiHandler := NewTransaksiHandler(transaksiUsecase)
	//migration temporary
	migrationHandler := NewMigrationHandler(dbPool)

	// 3. Routing Setup
	api := r.Group("/api")
	{
		// Modul Auth
		auth := api.Group("/users")
		{
			auth.POST("/register", userHandler.Register)
			auth.POST("/login", userHandler.Login)
			auth.PUT("/:id/foto", userHandler.UploadFotoProfil)
		}

		// Modul Obat
		obat := api.Group("/obat")
		{
			obat.POST("", obatHandler.CreateObat)
			obat.GET("", obatHandler.GetAllObat)
			obat.GET("/:id", obatHandler.GetObatByID)
			obat.PUT("/:id", obatHandler.UpdateObat)
			obat.DELETE("/:id", obatHandler.DeleteObat)
		}
		// Modul Customer
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

		//Modul transaksi
		transaksi := api.Group("/transaksi")
		{
			transaksi.POST("", transaksiHandler.Checkout)
			transaksi.GET("/:id", transaksiHandler.GetDetail)
			transaksi.PUT("/:id/batal", transaksiHandler.Batalkan)
		}

		// Modul Payment
		payment := api.Group("/checkout")
		{
			payment.POST("", paymentHandler.Checkout)
		}

		api.GET("/migrate-images", migrationHandler.RunImageMigration)
		api.POST("/restock", restockHandler.CreateRestock)

	}

	for _, route := range r.Routes() {
		fmt.Printf("Rute Terdaftar: %s %s\n", route.Method, route.Path)
		//debug gwah den
	}

	return r

}
