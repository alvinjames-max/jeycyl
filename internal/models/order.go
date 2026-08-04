package models

import "time"

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusConfirmed  OrderStatus = "confirmed"
	OrderStatusPaid       OrderStatus = "paid"
	OrderStatusInProgress OrderStatus = "in_progress"
	OrderStatusReady      OrderStatus = "ready"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

type Order struct {
	ID              int64       `json:"id"`
	CustomerID      int64       `json:"customer_id"`
	Status          OrderStatus `json:"status"`
	DeliveryDate    *time.Time  `json:"delivery_date,omitempty"`
	DeliveryAddress string      `json:"delivery_address,omitempty"`
	Notes           string      `json:"notes,omitempty"`
	TotalAmount     float64     `json:"total_amount"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`

	Items []OrderItem `json:"items,omitempty"`
}
