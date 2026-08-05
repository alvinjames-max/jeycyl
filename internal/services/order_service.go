package services

import (
	"fmt"

	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
)

type OrderService struct {
	orderRepo *repository.OrderRepository
	cakeRepo  *repository.CakeRepository
}

func NewOrderService(orderRepo *repository.OrderRepository, cakeRepo *repository.CakeRepository) *OrderService {
	return &OrderService{
		orderRepo: orderRepo,
		cakeRepo:  cakeRepo,
	}
}

type OrderItemRequest struct {
	CakeID        int64
	CakeVariantID *int64
	Quantity      int
	CustomMessage string
}

type PlaceOrderRequest struct {
	CustomerID      int64
	DeliveryAddress string
	Notes           string
	Items           []OrderItemRequest
}