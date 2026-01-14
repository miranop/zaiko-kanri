package config

import (
	"os"
)

type Config struct {
	ServerPort    string
	DatabasePath  string
	JWTSecret     string
	JWTExpiration int // hours
}

func Load() *Config {
	return &Config{
		ServerPort:    getEnv("SERVER_PORT", "8080"),
		DatabasePath:  getEnv("DATABASE_PATH", "./zaiko.db"),
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiration: 24,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
