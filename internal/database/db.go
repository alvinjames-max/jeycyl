// Package database handles the SQLite connection and schema initialization
// for the jeycyl-cakes backend.
package database

import (
	"database/sql"
	_ "embed"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// schemaSQL is embedded at build time so the binary doesn't depend on the
// schema.sql file being present at runtime.
//
//go:embed schema.sql
var schemaSQL string

// New opens a SQLite database at the given path, enables foreign key
// enforcement (off by default in SQLite), and applies the schema.
func New(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("opening database: %w", err)
	}

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("pinging database: %w", err)
	}

	if err := applySchema(db); err != nil {
		db.Close()
		return nil, fmt.Errorf("applying schema: %w", err)
	}

	return db, nil
}

// applySchema runs schema.sql against the given connection. All statements
// use CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS, so this is
// safe to run on every startup.
func applySchema(db *sql.DB) error {
	if _, err := db.Exec(schemaSQL); err != nil {
		return err
	}
	return nil
}
