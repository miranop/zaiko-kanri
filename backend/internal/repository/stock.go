package repository

import (
	"zaiko/internal/database"
	"zaiko/internal/models"
)

type StockRepository struct{}

func NewStockRepository() *StockRepository {
	return &StockRepository{}
}

func (r *StockRepository) FindAll(filter models.StockFilter) ([]models.Stock, error) {
	query := `
		SELECT s.id, s.product_id, s.warehouse_id, s.quantity, s.updated_at,
		       p.id, p.code, p.name, p.unit,
		       w.id, w.name, w.location
		FROM stock s
		JOIN products p ON s.product_id = p.id
		JOIN warehouses w ON s.warehouse_id = w.id
		WHERE 1=1
	`
	var args []interface{}

	if filter.ProductID > 0 {
		query += " AND s.product_id = ?"
		args = append(args, filter.ProductID)
	}

	if filter.WarehouseID > 0 {
		query += " AND s.warehouse_id = ?"
		args = append(args, filter.WarehouseID)
	}

	if filter.Search != "" {
		query += " AND (p.name LIKE ? OR p.code LIKE ?)"
		searchTerm := "%" + filter.Search + "%"
		args = append(args, searchTerm, searchTerm)
	}

	query += " ORDER BY p.name, w.name"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stocks []models.Stock
	for rows.Next() {
		var s models.Stock
		var p models.Product
		var w models.Warehouse
		var wLocation *string

		if err := rows.Scan(
			&s.ID, &s.ProductID, &s.WarehouseID, &s.Quantity, &s.UpdatedAt,
			&p.ID, &p.Code, &p.Name, &p.Unit,
			&w.ID, &w.Name, &wLocation,
		); err != nil {
			return nil, err
		}

		if wLocation != nil {
			w.Location = *wLocation
		}

		s.Product = &p
		s.Warehouse = &w
		stocks = append(stocks, s)
	}

	return stocks, nil
}

func (r *StockRepository) FindByProductAndWarehouse(productID, warehouseID int64) (*models.Stock, error) {
	var s models.Stock
	err := database.DB.QueryRow(`
		SELECT id, product_id, warehouse_id, quantity, updated_at
		FROM stock WHERE product_id = ? AND warehouse_id = ?
	`, productID, warehouseID).Scan(
		&s.ID, &s.ProductID, &s.WarehouseID, &s.Quantity, &s.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *StockRepository) UpdateQuantity(productID, warehouseID int64, delta int) error {
	_, err := database.DB.Exec(`
		INSERT INTO stock (product_id, warehouse_id, quantity, updated_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(product_id, warehouse_id) DO UPDATE SET
			quantity = quantity + ?,
			updated_at = CURRENT_TIMESTAMP
	`, productID, warehouseID, delta, delta)

	return err
}

func (r *StockRepository) GetTotalQuantity() (int, error) {
	var total int
	err := database.DB.QueryRow("SELECT COALESCE(SUM(quantity), 0) FROM stock").Scan(&total)
	return total, err
}

func (r *StockRepository) GetLowStockCount(threshold int) (int, error) {
	var count int
	err := database.DB.QueryRow(
		"SELECT COUNT(DISTINCT product_id) FROM stock WHERE quantity <= ?",
		threshold,
	).Scan(&count)
	return count, err
}
