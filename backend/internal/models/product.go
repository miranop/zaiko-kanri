package models

import "time"

type Product struct {
	ID          int64     `json:"id"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CategoryID  int64     `json:"category_id"`
	Category    *Category `json:"category,omitempty"`
	Unit        string    `json:"unit"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateProductRequest struct {
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	CategoryID  int64  `json:"category_id"`
	Unit        string `json:"unit" binding:"required"`
}

type UpdateProductRequest struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CategoryID  int64  `json:"category_id"`
	Unit        string `json:"unit"`
}

type ProductFilter struct {
	Search     string `form:"search"`
	CategoryID int64  `form:"category_id"`
}
