package database

import (
	"log"

	"golang.org/x/crypto/bcrypt"
)

func RunMigrations() error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS products (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			code TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			description TEXT,
			category_id INTEGER,
			unit TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (category_id) REFERENCES categories(id)
		)`,
		`CREATE TABLE IF NOT EXISTS warehouses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			location TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS stock (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			product_id INTEGER NOT NULL,
			warehouse_id INTEGER NOT NULL,
			quantity INTEGER DEFAULT 0,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (product_id) REFERENCES products(id),
			FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
			UNIQUE(product_id, warehouse_id)
		)`,
		`CREATE TABLE IF NOT EXISTS transactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			product_id INTEGER NOT NULL,
			warehouse_id INTEGER NOT NULL,
			type TEXT NOT NULL CHECK(type IN ('in', 'out')),
			quantity INTEGER NOT NULL,
			note TEXT,
			user_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (product_id) REFERENCES products(id),
			FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
		`CREATE INDEX IF NOT EXISTS idx_stock_product ON stock(product_id)`,
		`CREATE INDEX IF NOT EXISTS idx_stock_warehouse ON stock(warehouse_id)`,
		`CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id)`,
		`CREATE INDEX IF NOT EXISTS idx_transactions_warehouse ON transactions(warehouse_id)`,
	}

	for _, migration := range migrations {
		if _, err := DB.Exec(migration); err != nil {
			return err
		}
	}

	log.Println("Database migrations completed successfully")
	return nil
}

func SeedDefaultData() error {
	// Check if admin user exists
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", "admin").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		// Create default admin user
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		_, err = DB.Exec(
			"INSERT INTO users (username, password_hash) VALUES (?, ?)",
			"admin",
			string(hashedPassword),
		)
		if err != nil {
			return err
		}
		log.Println("Default admin user created (username: admin, password: admin)")
	}

	// Add default categories if none exist
	err = DB.QueryRow("SELECT COUNT(*) FROM categories").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		defaultCategories := []string{"電子機器", "事務用品", "消耗品", "その他"}
		for _, name := range defaultCategories {
			_, err = DB.Exec("INSERT INTO categories (name) VALUES (?)", name)
			if err != nil {
				return err
			}
		}
		log.Println("Default categories created")
	}

	return nil
}
