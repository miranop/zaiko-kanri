package models

import "time"

type TransactionType string

const (
	TransactionTypeIn  TransactionType = "in"
	TransactionTypeOut TransactionType = "out"
)

type Transaction struct {
	ID          int64           `json:"id"`
	ProductID   int64           `json:"product_id"`
	Product     *Product        `json:"product,omitempty"`
	WarehouseID int64           `json:"warehouse_id"`
	Warehouse   *Warehouse      `json:"warehouse,omitempty"`
	Type        TransactionType `json:"type"`
	Quantity    int             `json:"quantity"`
	Note        string          `json:"note"`
	UserID      int64           `json:"user_id"`
	User        *User           `json:"user,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
}

type TransactionFilter struct {
	ProductID   int64  `form:"product_id"`
	WarehouseID int64  `form:"warehouse_id"`
	Type        string `form:"type"`
	Limit       int    `form:"limit"`
}
