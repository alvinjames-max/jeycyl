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