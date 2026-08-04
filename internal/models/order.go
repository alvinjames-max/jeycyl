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

type OrderItem struct {
	ID            int64   `json:"id"`
	OrderID       int64   `json:"order_id"`
	CakeID        int64   `json:"cake_id"`
	CakeVariantID *int64  `json:"cake_variant_id,omitempty"`
	Quantity      int     `json:"quantity"`
	UnitPrice     float64 `json:"unit_price"`
	CustomMessage string  `json:"custom_message,omitempty"`
	Subtotal      float64 `json:"subtotal"`
}

type PaymentMethod string

const (
	PaymentMethodMpesa PaymentMethod = "mpesa"
	PaymentMethodCash  PaymentMethod = "cash"
	PaymentMethodCard  PaymentMethod = "card"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusCompleted PaymentStatus = "completed"
	PaymentStatusFailed    PaymentStatus = "failed"
)

type Payment struct {
	ID             int64         `json:"id"`
	OrderID        int64         `json:"order_id"`
	Amount         float64       `json:"amount"`
	Method         PaymentMethod `json:"method"`
	TransactionRef string        `json:"transaction_ref,omitempty"`
	Status         PaymentStatus `json:"status"`
	PaidAt         *time.Time    `json:"paid_at,omitempty"`
	CreatedAt      time.Time     `json:"created_at"`
}
