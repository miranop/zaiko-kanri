package models

type Category struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}
