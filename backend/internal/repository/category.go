package repository

import (
	"zaiko/internal/database"
	"zaiko/internal/models"
)

type CategoryRepository struct{}

func NewCategoryRepository() *CategoryRepository {
	return &CategoryRepository{}
}

func (r *CategoryRepository) FindAll() ([]models.Category, error) {
	rows, err := database.DB.Query("SELECT id, name FROM categories ORDER BY name")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var category models.Category
		if err := rows.Scan(&category.ID, &category.Name); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}

	return categories, nil
}

func (r *CategoryRepository) FindByID(id int64) (*models.Category, error) {
	category := &models.Category{}
	err := database.DB.QueryRow(
		"SELECT id, name FROM categories WHERE id = ?",
		id,
	).Scan(&category.ID, &category.Name)

	if err != nil {
		return nil, err
	}
	return category, nil
}

func (r *CategoryRepository) Create(name string) (*models.Category, error) {
	result, err := database.DB.Exec("INSERT INTO categories (name) VALUES (?)", name)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &models.Category{ID: id, Name: name}, nil
}

func (r *CategoryRepository) Delete(id int64) error {
	_, err := database.DB.Exec("DELETE FROM categories WHERE id = ?", id)
	return err
}
