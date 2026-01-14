package repository

import (
	"zaiko/internal/database"
	"zaiko/internal/models"
)

type TransactionRepository struct{}

func NewTransactionRepository() *TransactionRepository {
	return &TransactionRepository{}
}

func (r *TransactionRepository) Create(
	productID, warehouseID int64,
	txType models.TransactionType,
	quantity int,
	note string,
	userID int64,
) (*models.Transaction, error) {
	result, err := database.DB.Exec(`
		INSERT INTO transactions (product_id, warehouse_id, type, quantity, note, user_id)
		VALUES (?, ?, ?, ?, ?, ?)
	`, productID, warehouseID, txType, quantity, note, userID)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return r.FindByID(id)
}

func (r *TransactionRepository) FindByID(id int64) (*models.Transaction, error) {
	var t models.Transaction
	var note *string

	err := database.DB.QueryRow(`
		SELECT id, product_id, warehouse_id, type, quantity, note, user_id, created_at
		FROM transactions WHERE id = ?
	`, id).Scan(
		&t.ID, &t.ProductID, &t.WarehouseID, &t.Type, &t.Quantity, &note, &t.UserID, &t.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	if note != nil {
		t.Note = *note
	}

	return &t, nil
}

func (r *TransactionRepository) FindAll(filter models.TransactionFilter) ([]models.Transaction, error) {
	query := `
		SELECT t.id, t.product_id, t.warehouse_id, t.type, t.quantity, t.note, t.user_id, t.created_at,
		       p.id, p.code, p.name, p.unit,
		       w.id, w.name,
		       u.id, u.username
		FROM transactions t
		JOIN products p ON t.product_id = p.id
		JOIN warehouses w ON t.warehouse_id = w.id
		JOIN users u ON t.user_id = u.id
		WHERE 1=1
	`
	var args []interface{}

	if filter.ProductID > 0 {
		query += " AND t.product_id = ?"
		args = append(args, filter.ProductID)
	}

	if filter.WarehouseID > 0 {
		query += " AND t.warehouse_id = ?"
		args = append(args, filter.WarehouseID)
	}

	if filter.Type != "" {
		query += " AND t.type = ?"
		args = append(args, filter.Type)
	}

	query += " ORDER BY t.created_at DESC"

	if filter.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filter.Limit)
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []models.Transaction
	for rows.Next() {
		var t models.Transaction
		var note *string
		var p models.Product
		var w models.Warehouse
		var u models.User

		if err := rows.Scan(
			&t.ID, &t.ProductID, &t.WarehouseID, &t.Type, &t.Quantity, &note, &t.UserID, &t.CreatedAt,
			&p.ID, &p.Code, &p.Name, &p.Unit,
			&w.ID, &w.Name,
			&u.ID, &u.Username,
		); err != nil {
			return nil, err
		}

		if note != nil {
			t.Note = *note
		}

		t.Product = &p
		t.Warehouse = &w
		t.User = &u
		transactions = append(transactions, t)
	}

	return transactions, nil
}
