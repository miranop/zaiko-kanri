package repository

import (
	"fmt"
	"strings"

	"zaiko/internal/database"
	"zaiko/internal/models"
)

type ProductRepository struct{}

func NewProductRepository() *ProductRepository {
	return &ProductRepository{}
}

func (r *ProductRepository) FindAll(filter models.ProductFilter) ([]models.Product, error) {
	query := `
		SELECT p.id, p.code, p.name, p.description, p.category_id, p.unit, p.created_at,
		       c.id, c.name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE 1=1
	`
	var args []interface{}

	if filter.Search != "" {
		query += " AND (p.name LIKE ? OR p.code LIKE ?)"
		searchTerm := "%" + filter.Search + "%"
		args = append(args, searchTerm, searchTerm)
	}

	if filter.CategoryID > 0 {
		query += " AND p.category_id = ?"
		args = append(args, filter.CategoryID)
	}

	query += " ORDER BY p.name"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		var categoryID, catID *int64
		var catName *string

		if err := rows.Scan(
			&p.ID, &p.Code, &p.Name, &p.Description, &categoryID, &p.Unit, &p.CreatedAt,
			&catID, &catName,
		); err != nil {
			return nil, err
		}

		if categoryID != nil {
			p.CategoryID = *categoryID
		}
		if catID != nil && catName != nil {
			p.Category = &models.Category{ID: *catID, Name: *catName}
		}

		products = append(products, p)
	}

	return products, nil
}

func (r *ProductRepository) FindByID(id int64) (*models.Product, error) {
	var p models.Product
	var categoryID, catID *int64
	var catName *string

	err := database.DB.QueryRow(`
		SELECT p.id, p.code, p.name, p.description, p.category_id, p.unit, p.created_at,
		       c.id, c.name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.id = ?
	`, id).Scan(
		&p.ID, &p.Code, &p.Name, &p.Description, &categoryID, &p.Unit, &p.CreatedAt,
		&catID, &catName,
	)

	if err != nil {
		return nil, err
	}

	if categoryID != nil {
		p.CategoryID = *categoryID
	}
	if catID != nil && catName != nil {
		p.Category = &models.Category{ID: *catID, Name: *catName}
	}

	return &p, nil
}

func (r *ProductRepository) Create(req models.CreateProductRequest) (*models.Product, error) {
	var categoryID interface{}
	if req.CategoryID > 0 {
		categoryID = req.CategoryID
	}

	result, err := database.DB.Exec(
		"INSERT INTO products (code, name, description, category_id, unit) VALUES (?, ?, ?, ?, ?)",
		req.Code, req.Name, req.Description, categoryID, req.Unit,
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

func (r *ProductRepository) Update(id int64, req models.UpdateProductRequest) (*models.Product, error) {
	var updates []string
	var args []interface{}

	if req.Code != "" {
		updates = append(updates, "code = ?")
		args = append(args, req.Code)
	}
	if req.Name != "" {
		updates = append(updates, "name = ?")
		args = append(args, req.Name)
	}
	if req.Description != "" {
		updates = append(updates, "description = ?")
		args = append(args, req.Description)
	}
	if req.CategoryID > 0 {
		updates = append(updates, "category_id = ?")
		args = append(args, req.CategoryID)
	}
	if req.Unit != "" {
		updates = append(updates, "unit = ?")
		args = append(args, req.Unit)
	}

	if len(updates) == 0 {
		return r.FindByID(id)
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE products SET %s WHERE id = ?", strings.Join(updates, ", "))

	_, err := database.DB.Exec(query, args...)
	if err != nil {
		return nil, err
	}

	return r.FindByID(id)
}

func (r *ProductRepository) Delete(id int64) error {
	_, err := database.DB.Exec("DELETE FROM products WHERE id = ?", id)
	return err
}
