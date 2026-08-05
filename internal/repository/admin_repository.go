package repository

import (
	"database/sql"
	"fmt"

	"github.com/alvinjames-max/jeycyl/internal/models"
)

type AdminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) Create(a *models.Admin) (int64, error) {
	res, err := r.db.Exec(`
		INSERT INTO admins (username, password_hash)
		VALUES (?, ?)
	`, a.Username, a.PasswordHash)
	if err != nil {
		return 0, fmt.Errorf("creating admin: %w", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("getting new admin id: %w", err)
	}

	return id, nil
}

func (r *AdminRepository) GetByUsername(username string) (*models.Admin, error) {
	var a models.Admin
	err := r.db.QueryRow(`
		SELECT id, username, password_hash, created_at
		FROM admins
		WHERE username = ?
	`, username).Scan(&a.ID, &a.Username, &a.PasswordHash, &a.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("getting admin %q: %w", username, err)
	}

	return &a, nil
}

func (r *AdminRepository) GetByID(id int64) (*models.Admin, error) {
	var a models.Admin
	err := r.db.QueryRow(`
		SELECT id, username, password_hash, created_at
		FROM admins
		WHERE id = ?
	`, id).Scan(&a.ID, &a.Username, &a.PasswordHash, &a.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("getting admin %d: %w", id, err)
	}

	return &a, nil
}