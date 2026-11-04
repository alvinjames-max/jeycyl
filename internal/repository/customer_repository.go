package repository

import (
	"database/sql"
	"fmt"

	"github.com/alvinjames-max/jeycyl/internal/models"
)

type CustomerRepository struct {
	db *sql.DB
}

func NewCustomerRepository(db *sql.DB) *CustomerRepository {
	return &CustomerRepository{db: db}
}

func (r *CustomerRepository) Create(c *models.Customer) (int64, error) {
	res, err := r.db.Exec(`
		INSERT INTO customers (name, phone, email, address)
		VALUES (?, ?, ?, ?)
	`, c.Name, c.Phone, c.Email, c.Address)
	if err != nil {
		return 0, fmt.Errorf("creating customer: %w", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("getting new customer id: %w", err)
	}

	return id, nil
}

func (r *CustomerRepository) GetByID(id int64) (*models.Customer, error) {
	var c models.Customer
	err := r.db.QueryRow(`
		SELECT id, name, phone, email, address, created_at
		FROM customers
		WHERE id = ?
	`, id).Scan(&c.ID, &c.Name, &c.Phone, &c.Email, &c.Address, &c.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("getting customer %d: %w", id, err)
	}

	return &c, nil
}

func (r *CustomerRepository) GetByPhone(phone string) (*models.Customer, error) {
	var c models.Customer
	err := r.db.QueryRow(`
		SELECT id, name, phone, email, address, created_at
		FROM customers
		WHERE phone = ?
	`, phone).Scan(&c.ID, &c.Name, &c.Phone, &c.Email, &c.Address, &c.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("getting customer by phone %q: %w", phone, err)
	}

	return &c, nil
}

func (r *CustomerRepository) ListAll() ([]models.Customer, error) {
	rows, err := r.db.Query(`
		SELECT id, name, phone, email, address, created_at
		FROM customers
		ORDER BY id DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("listing customers: %w", err)
	}
	defer rows.Close()

	var list []models.Customer
	for rows.Next() {
		var c models.Customer
		if err := rows.Scan(&c.ID, &c.Name, &c.Phone, &c.Email, &c.Address, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("scanning customer: %w", err)
		}
		list = append(list, c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating customers: %w", err)
	}

	return list, nil
}

