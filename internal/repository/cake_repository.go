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

func (r *CakeRepository) GetByID(id int64) (*models.Cake, error) {
	var c models.Cake
	err := r.db.QueryRow(`
		SELECT id, name, description, base_price, image_url, is_available, created_at
		FROM cakes
		WHERE id = ?
	`, id).Scan(&c.ID, &c.Name, &c.Description, &c.BasePrice, &c.ImageURL, &c.IsAvailable, &c.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("getting cake %d: %w", id, err)
	}

	variants, err := r.variantsForCake(id)
	if err != nil {
		return nil, err
	}
	c.Variants = variants

	return &c, nil
}

func (r *CakeRepository) variantsForCake(cakeID int64) ([]models.CakeVariant, error) {
	rows, err := r.db.Query(`
		SELECT id, cake_id, size, flavor, price_modifier
		FROM cake_variants
		WHERE cake_id = ?
		ORDER BY size
	`, cakeID)
	if err != nil {
		return nil, fmt.Errorf("listing variants for cake %d: %w", cakeID, err)
	}
	defer rows.Close()

	var variants []models.CakeVariant
	for rows.Next() {
		var v models.CakeVariant
		if err := rows.Scan(&v.ID, &v.CakeID, &v.Size, &v.Flavor, &v.PriceModifier); err != nil {
			return nil, fmt.Errorf("scanning variant: %w", err)
		}
		variants = append(variants, v)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating variants: %w", err)
	}

	return variants, nil
}
