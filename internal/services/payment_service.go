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