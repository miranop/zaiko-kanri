package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"zaiko/internal/middleware"
	"zaiko/internal/models"
	"zaiko/internal/repository"
)

type StockHandler struct {
	stockRepo       *repository.StockRepository
	transactionRepo *repository.TransactionRepository
}

func NewStockHandler() *StockHandler {
	return &StockHandler{
		stockRepo:       repository.NewStockRepository(),
		transactionRepo: repository.NewTransactionRepository(),
	}
}

func (h *StockHandler) GetAll(c *gin.Context) {
	var filter models.StockFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stocks, err := h.stockRepo.FindAll(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if stocks == nil {
		stocks = []models.Stock{}
	}

	c.JSON(http.StatusOK, stocks)
}

func (h *StockHandler) StockIn(c *gin.Context) {
	var req models.StockMovementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)

	// Update stock quantity
	if err := h.stockRepo.UpdateQuantity(req.ProductID, req.WarehouseID, req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Record transaction
	transaction, err := h.transactionRepo.Create(
		req.ProductID,
		req.WarehouseID,
		models.TransactionTypeIn,
		req.Quantity,
		req.Note,
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Stock received successfully",
		"transaction": transaction,
	})
}

func (h *StockHandler) StockOut(c *gin.Context) {
	var req models.StockMovementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)

	// Check current stock
	stock, err := h.stockRepo.FindByProductAndWarehouse(req.ProductID, req.WarehouseID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock record not found"})
		return
	}

	if stock.Quantity < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":     "Insufficient stock",
			"available": stock.Quantity,
			"requested": req.Quantity,
		})
		return
	}

	// Update stock quantity (negative for outbound)
	if err := h.stockRepo.UpdateQuantity(req.ProductID, req.WarehouseID, -req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Record transaction
	transaction, err := h.transactionRepo.Create(
		req.ProductID,
		req.WarehouseID,
		models.TransactionTypeOut,
		req.Quantity,
		req.Note,
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Stock shipped successfully",
		"transaction": transaction,
	})
}

func (h *StockHandler) GetTransactions(c *gin.Context) {
	var filter models.TransactionFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transactions, err := h.transactionRepo.FindAll(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if transactions == nil {
		transactions = []models.Transaction{}
	}

	c.JSON(http.StatusOK, transactions)
}
