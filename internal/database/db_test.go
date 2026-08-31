package database_test

import (
	"path/filepath"
	"testing"

	"github.com/alvinjames-max/jeycyl/internal/database"
)

func TestNewDatabase(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_orders.db")

	db, err := database.New(dbPath)
	if err != nil {
		t.Fatalf("failed to create database: %v", err)
	}
	defer db.Close()

	// Verify tables were created
	tables := []string{"customers", "cakes", "cake_variants", "orders", "order_items", "payments", "admins"}
	for _, table := range tables {
		var name string
		err := db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name=?", table).Scan(&name)
		if err != nil {
			t.Errorf("table %s was not created: %v", table, err)
		}
	}
}
