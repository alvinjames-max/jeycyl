package repository

import (
	"database/sql"
	"fmt"

	"github.com/alvinjames-max/jeycyl/internal/models"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(o *models.Order) (int64, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return 0, fmt.Errorf("beginning transaction: %w", err)
	}
	defer tx.Rollback()

	res, err := tx.Exec(`
		INSERT INTO orders (customer_id, status, delivery_date, delivery_address, notes, total_amount)
		VALUES (?, ?, ?, ?, ?, ?)
	`, o.CustomerID, o.Status, o.DeliveryDate, o.DeliveryAddress, o.Notes, o.TotalAmount)
	if err != nil {
		return 0, fmt.Errorf("creating order: %w", err)
	}

	orderID, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("getting new order id: %w", err)
	}

	for _, item := range o.Items {
		_, err := tx.Exec(`
			INSERT INTO order_items (order_id, cake_id, cake_variant_id, quantity, unit_price, custom_message, subtotal)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, orderID, item.CakeID, item.CakeVariantID, item.Quantity, item.UnitPrice, item.CustomMessage, item.Subtotal)
		if err != nil {
			return 0, fmt.Errorf("creating order item: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("committing order: %w", err)
	}

	return orderID, nil
}