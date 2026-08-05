package services

import (
	"database/sql"
	"fmt"

	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
)

type PaymentService struct {
	db        *sql.DB
	orderRepo *repository.OrderRepository
}

func NewPaymentService(db *sql.DB, orderRepo *repository.OrderRepository) *PaymentService {
	return &PaymentService{
		db:        db,
		orderRepo: orderRepo,
	}
}

type RecordPaymentRequest struct {
	OrderID        int64
	Amount         float64
	Method         models.PaymentMethod
	TransactionRef string
}

func (s *PaymentService) RecordPayment(req RecordPaymentRequest) (*models.Payment, error) {
	order, err := s.orderRepo.GetByID(req.OrderID)
	if err != nil {
		return nil, fmt.Errorf("looking up order %d: %w", req.OrderID, err)
	}
	if order == nil {
		return nil, fmt.Errorf("order %d not found", req.OrderID)
	}

	if req.Amount != order.TotalAmount {
		return nil, fmt.Errorf("payment amount %.2f does not match order total %.2f", req.Amount, order.TotalAmount)
	}

	res, err := s.db.Exec(`
		INSERT INTO payments (order_id, amount, method, transaction_ref, status, paid_at)
		VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`, req.OrderID, req.Amount, req.Method, req.TransactionRef, models.PaymentStatusCompleted)
	if err != nil {
		return nil, fmt.Errorf("recording payment: %w", err)
	}

	paymentID, err := res.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("getting new payment id: %w", err)
	}

	if err := s.orderRepo.UpdateStatus(req.OrderID, models.OrderStatusPaid); err != nil {
		return nil, fmt.Errorf("updating order status after payment: %w", err)
	}

	payment := &models.Payment{
		ID:             paymentID,
		OrderID:        req.OrderID,
		Amount:         req.Amount,
		Method:         req.Method,
		TransactionRef: req.TransactionRef,
		Status:         models.PaymentStatusCompleted,
	}

	return payment, nil
}