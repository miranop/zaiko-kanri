package repository

import (
	"fmt"
	"strings"

	"zaiko/internal/database"
	"zaiko/internal/models"
)

type WarehouseRepository struct{}

func NewWarehouseRepository() *WarehouseRepository {
	return &WarehouseRepository{}
}

func (r *WarehouseRepository) FindAll() ([]models.Warehouse, error) {
	rows, err := database.DB.Query("SELECT id, name, location FROM warehouses ORDER BY name")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var warehouses []models.Warehouse
	for rows.Next() {
		var w models.Warehouse
		var location *string
		if err := rows.Scan(&w.ID, &w.Name, &location); err != nil {
			return nil, err
		}
		if location != nil {
			w.Location = *location
		}
		warehouses = append(warehouses, w)
	}

	return warehouses, nil
}

func (r *WarehouseRepository) FindByID(id int64) (*models.Warehouse, error) {
	var w models.Warehouse
	var location *string

	err := database.DB.QueryRow(
		"SELECT id, name, location FROM warehouses WHERE id = ?",
		id,
	).Scan(&w.ID, &w.Name, &location)

	if err != nil {
		return nil, err
	}

	if location != nil {
		w.Location = *location
	}

	return &w, nil
}

func (r *WarehouseRepository) Create(req models.CreateWarehouseRequest) (*models.Warehouse, error) {
	result, err := database.DB.Exec(
		"INSERT INTO warehouses (name, location) VALUES (?, ?)",
		req.Name, req.Location,
	)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return r.FindByID(id)
}

func (r *WarehouseRepository) Update(id int64, req models.UpdateWarehouseRequest) (*models.Warehouse, error) {
	var updates []string
	var args []interface{}

	if req.Name != "" {
		updates = append(updates, "name = ?")
		args = append(args, req.Name)
	}
	if req.Location != "" {
		updates = append(updates, "location = ?")
		args = append(args, req.Location)
	}

	if len(updates) == 0 {
		return r.FindByID(id)
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE warehouses SET %s WHERE id = ?", strings.Join(updates, ", "))

	_, err := database.DB.Exec(query, args...)
	if err != nil {
		return nil, err
	}

	return r.FindByID(id)
}

func (r *WarehouseRepository) Delete(id int64) error {
	_, err := database.DB.Exec("DELETE FROM warehouses WHERE id = ?", id)
	return err
}
