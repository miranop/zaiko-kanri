package models

type Warehouse struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	Location string `json:"location"`
}

type CreateWarehouseRequest struct {
	Name     string `json:"name" binding:"required"`
	Location string `json:"location"`
}

type UpdateWarehouseRequest struct {
	Name     string `json:"name"`
	Location string `json:"location"`
}
