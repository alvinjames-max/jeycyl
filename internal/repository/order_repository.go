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

func (r *OrderRepository) GetByID(id int64) (*models.Order, error) {
	var o models.Order
	err := r.db.QueryRow(`
		SELECT id, customer_id, status, delivery_date, delivery_address, notes, total_amount, created_at, updated_at
		FROM orders
		WHERE id = ?
	`, id).Scan(&o.ID, &o.CustomerID, &o.Status, &o.DeliveryDate, &o.DeliveryAddress, &o.Notes, &o.TotalAmount, &o.CreatedAt, &o.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("getting order %d: %w", id, err)
	}

	items, err := r.itemsForOrder(id)
	if err != nil {
		return nil, err
	}
	o.Items = items

	return &o, nil
}

func (r *OrderRepository) itemsForOrder(orderID int64) ([]models.OrderItem, error) {
	rows, err := r.db.Query(`
		SELECT id, order_id, cake_id, cake_variant_id, quantity, unit_price, custom_message, subtotal
		FROM order_items
		WHERE order_id = ?
	`, orderID)
	if err != nil {
		return nil, fmt.Errorf("listing items for order %d: %w", orderID, err)
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		var i models.OrderItem
		if err := rows.Scan(&i.ID, &i.OrderID, &i.CakeID, &i.CakeVariantID, &i.Quantity, &i.UnitPrice, &i.CustomMessage, &i.Subtotal); err != nil {
			return nil, fmt.Errorf("scanning order item: %w", err)
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating order items: %w", err)
	}

	return items, nil
}

func (r *OrderRepository) ListByCustomer(customerID int64) ([]models.Order, error) {
	rows, err := r.db.Query(`
		SELECT id, customer_id, status, delivery_date, delivery_address, notes, total_amount, created_at, updated_at
		FROM orders
		WHERE customer_id = ?
		ORDER BY created_at DESC
	`, customerID)
	if err != nil {
		return nil, fmt.Errorf("listing orders for customer %d: %w", customerID, err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(&o.ID, &o.CustomerID, &o.Status, &o.DeliveryDate, &o.DeliveryAddress, &o.Notes, &o.TotalAmount, &o.CreatedAt, &o.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scanning order: %w", err)
		}
		orders = append(orders, o)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating orders: %w", err)
	}

	return orders, nil
}

func (r *OrderRepository) UpdateStatus(id int64, status models.OrderStatus) error {
	res, err := r.db.Exec(`
		UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
	`, status, id)
	if err != nil {
		return fmt.Errorf("updating order %d status: %w", id, err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("checking rows affected for order %d: %w", id, err)
	}
	if rows == 0 {
		return fmt.Errorf("order %d not found", id)
	}

	return nil
}