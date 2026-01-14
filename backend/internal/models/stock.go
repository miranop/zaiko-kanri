package models

import "time"

type Stock struct {
	ID          int64      `json:"id"`
	ProductID   int64      `json:"product_id"`
	Product     *Product   `json:"product,omitempty"`
	WarehouseID int64      `json:"warehouse_id"`
	Warehouse   *Warehouse `json:"warehouse,omitempty"`
	Quantity    int        `json:"quantity"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type StockFilter struct {
	ProductID   int64  `form:"product_id"`
	WarehouseID int64  `form:"warehouse_id"`
	Search      string `form:"search"`
}

type StockMovementRequest struct {
	ProductID   int64  `json:"product_id" binding:"required"`
	WarehouseID int64  `json:"warehouse_id" binding:"required"`
	Quantity    int    `json:"quantity" binding:"required,min=1"`
	Note        string `json:"note"`
}
