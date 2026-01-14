package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"zaiko/internal/config"
	"zaiko/internal/database"
	"zaiko/internal/handlers"
	"zaiko/internal/middleware"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set JWT secret
	middleware.SetJWTSecret(cfg.JWTSecret)

	// Connect to database
	if err := database.Connect(cfg.DatabasePath); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Seed default data
	if err := database.SeedDefaultData(); err != nil {
		log.Fatalf("Failed to seed default data: %v", err)
	}

	// Initialize Gin router
	router := gin.Default()

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(cfg.JWTExpiration)
	categoryHandler := handlers.NewCategoryHandler()
	productHandler := handlers.NewProductHandler()
	warehouseHandler := handlers.NewWarehouseHandler()
	stockHandler := handlers.NewStockHandler()
	dashboardHandler := handlers.NewDashboardHandler()

	// API routes
	api := router.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Auth
			protected.GET("/auth/me", authHandler.Me)

			// Categories
			protected.GET("/categories", categoryHandler.GetAll)
			protected.POST("/categories", categoryHandler.Create)
			protected.DELETE("/categories/:id", categoryHandler.Delete)

			// Products
			protected.GET("/products", productHandler.GetAll)
			protected.GET("/products/:id", productHandler.GetByID)
			protected.POST("/products", productHandler.Create)
			protected.PUT("/products/:id", productHandler.Update)
			protected.DELETE("/products/:id", productHandler.Delete)

			// Warehouses
			protected.GET("/warehouses", warehouseHandler.GetAll)
			protected.GET("/warehouses/:id", warehouseHandler.GetByID)
			protected.POST("/warehouses", warehouseHandler.Create)
			protected.PUT("/warehouses/:id", warehouseHandler.Update)
			protected.DELETE("/warehouses/:id", warehouseHandler.Delete)

			// Stock
			protected.GET("/stock", stockHandler.GetAll)
			protected.POST("/stock/in", stockHandler.StockIn)
			protected.POST("/stock/out", stockHandler.StockOut)
			protected.GET("/stock/transactions", stockHandler.GetTransactions)

			// Dashboard
			protected.GET("/dashboard/summary", dashboardHandler.GetSummary)
		}
	}

	// Start server
	log.Printf("Server starting on port %s...", cfg.ServerPort)
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
