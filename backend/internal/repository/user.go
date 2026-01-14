package repository

import (
	"zaiko/internal/database"
	"zaiko/internal/models"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
	user := &models.User{}
	err := database.DB.QueryRow(
		"SELECT id, username, password_hash, created_at FROM users WHERE username = ?",
		username,
	).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt)

	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) FindByID(id int64) (*models.User, error) {
	user := &models.User{}
	err := database.DB.QueryRow(
		"SELECT id, username, password_hash, created_at FROM users WHERE id = ?",
		id,
	).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt)

	if err != nil {
		return nil, err
	}
	return user, nil
}
