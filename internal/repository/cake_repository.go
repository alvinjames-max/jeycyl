package repository

import (
	"database/sql"
	"fmt"

	"github.com/alvinjames-max/jeycyl/internal/models"
)

type CakeRepository struct {
	db *sql.DB
}

func NewCakeRepository(db *sql.DB) *CakeRepository {
	return &CakeRepository{db: db}
}

func (r *CakeRepository) ListAvailable() ([]models.Cake, error) {
	rows, err := r.db.Query(`
		SELECT id, name, description, base_price, image_url, is_available, created_at
		FROM cakes
		WHERE is_available = 1
		ORDER BY name
	`)
	if err != nil {
		return nil, fmt.Errorf("listing cakes: %w", err)
	}
	defer rows.Close()

	var cakes []models.Cake
	for rows.Next() {
		var c models.Cake
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.BasePrice, &c.ImageURL, &c.IsAvailable, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("scanning cake: %w", err)
		}
		cakes = append(cakes, c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating cakes: %w", err)
	}

	return cakes, nil
}