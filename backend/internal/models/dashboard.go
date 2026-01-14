package models

type DashboardSummary struct {
	TotalProducts       int                    `json:"total_products"`
	TotalWarehouses     int                    `json:"total_warehouses"`
	TotalStockValue     int                    `json:"total_stock_value"`
	LowStockItems       int                    `json:"low_stock_items"`
	RecentTransactions  []Transaction          `json:"recent_transactions"`
	StockByWarehouse    []WarehouseStockSummary `json:"stock_by_warehouse"`
	StockByCategory     []CategoryStockSummary  `json:"stock_by_category"`
}

type WarehouseStockSummary struct {
	WarehouseID   int64  `json:"warehouse_id"`
	WarehouseName string `json:"warehouse_name"`
	TotalItems    int    `json:"total_items"`
	TotalQuantity int    `json:"total_quantity"`
}

type CategoryStockSummary struct {
	CategoryID    int64  `json:"category_id"`
	CategoryName  string `json:"category_name"`
	TotalItems    int    `json:"total_items"`
	TotalQuantity int    `json:"total_quantity"`
}
