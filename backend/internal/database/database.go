package database

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func Connect(databasePath string) error {
	var err error
	DB, err = sql.Open("sqlite3", databasePath)
	if err != nil {
		return err
	}

	if err = DB.Ping(); err != nil {
		return err
	}

	log.Println("Database connected successfully")
	return nil
}

func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
