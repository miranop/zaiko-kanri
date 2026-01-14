package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"zaiko/internal/database"
	"zaiko/internal/models"
	"zaiko/internal/repository"
)

type DashboardHandler struct {
	stockRepo       *repository.StockRepository
	transactionRepo *repository.TransactionRepository
}

func NewDashboardHandler() *DashboardHandler {
	return &DashboardHandler{
		stockRepo:       repository.NewStockRepository(),
		transactionRepo: repository.NewTransactionRepository(),
	}
}

func (h *DashboardHandler) GetSummary(c *gin.Context) {
	summary := models.DashboardSummary{}

	// Total products
	if err := database.DB.QueryRow("SELECT COUNT(*) FROM products").Scan(&summary.TotalProducts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Total warehouses
	if err := database.DB.QueryRow("SELECT COUNT(*) FROM warehouses").Scan(&summary.TotalWarehouses); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Total stock value (quantity)
	totalStock, err := h.stockRepo.GetTotalQuantity()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	summary.TotalStockValue = totalStock

	// Low stock items (threshold: 10)
	lowStock, err := h.stockRepo.GetLowStockCount(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	summary.LowStockItems = lowStock

	// Recent transactions
	transactions, err := h.transactionRepo.FindAll(models.TransactionFilter{Limit: 10})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	summary.RecentTransactions = transactions

	// Stock by warehouse
	warehouseRows, err := database.DB.Query(`
		SELECT w.id, w.name, COUNT(DISTINCT s.product_id), COALESCE(SUM(s.quantity), 0)
		FROM warehouses w
		LEFT JOIN stock s ON w.id = s.warehouse_id
		GROUP BY w.id, w.name
		ORDER BY w.name
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer warehouseRows.Close()

	for warehouseRows.Next() {
		var ws models.WarehouseStockSummary
		if err := warehouseRows.Scan(&ws.WarehouseID, &ws.WarehouseName, &ws.TotalItems, &ws.TotalQuantity); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		summary.StockByWarehouse = append(summary.StockByWarehouse, ws)
	}

	// Stock by category
	categoryRows, err := database.DB.Query(`
		SELECT c.id, c.name, COUNT(DISTINCT s.product_id), COALESCE(SUM(s.quantity), 0)
		FROM categories c
		LEFT JOIN products p ON c.id = p.category_id
		LEFT JOIN stock s ON p.id = s.product_id
		GROUP BY c.id, c.name
		ORDER BY c.name
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer categoryRows.Close()

	for categoryRows.Next() {
		var cs models.CategoryStockSummary
		if err := categoryRows.Scan(&cs.CategoryID, &cs.CategoryName, &cs.TotalItems, &cs.TotalQuantity); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		summary.StockByCategory = append(summary.StockByCategory, cs)
	}

	c.JSON(http.StatusOK, summary)
}
