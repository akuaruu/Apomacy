package http

import (
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
		AllowOrigins:     []string{"http://localhost:3000"},
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

	// Domain: transaction
	paymentUsecase := usecase.NewPaymentUsecase()
	paymentHandler := NewPaymentHandler(paymentUsecase)

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
		}

		// Modul Obat
		obat := api.Group("/obat")
		{
			obat.POST("/", obatHandler.CreateObat)
			obat.GET("/", obatHandler.GetAllObat)
			obat.GET("/:id", obatHandler.GetObatByID)
			obat.PUT("/:id", obatHandler.UpdateObat)
			obat.DELETE("/:id", obatHandler.DeleteObat)
		}

		// Modul Customer
		customer := api.Group("/customer")
		{
			customer.POST("/", customerHandler.CreateCustomer)
			customer.GET("/", customerHandler.GetAllCustomers)
			customer.GET("/:id", customerHandler.GetCustomerByID)
			customer.PUT("/:id", customerHandler.UpdateCustomer)
		}

		// Modul Payment
		payment := api.Group("/checkout")
		{
			payment.POST("/", paymentHandler.Checkout)
		}

		api.GET("/migrate-images", migrationHandler.RunImageMigration)
	}

	return r
}
