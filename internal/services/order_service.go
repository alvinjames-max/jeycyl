package services

import (
	"fmt"
	"log"

	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
)

type OrderService struct {
	orderRepo    *repository.OrderRepository
	cakeRepo     *repository.CakeRepository
	customerRepo *repository.CustomerRepository
	whatsapp     *WhatsAppService
}

func NewOrderService(
	orderRepo *repository.OrderRepository,
	cakeRepo *repository.CakeRepository,
	customerRepo *repository.CustomerRepository,
	whatsapp *WhatsAppService,
) *OrderService {
	return &OrderService{
		orderRepo:    orderRepo,
		cakeRepo:     cakeRepo,
		customerRepo: customerRepo,
		whatsapp:     whatsapp,
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

func (s *OrderService) PlaceOrder(req PlaceOrderRequest) (*models.Order, error) {
	if len(req.Items) == 0 {
		return nil, fmt.Errorf("order must contain at least one item")
	}

	order := &models.Order{
		CustomerID:      req.CustomerID,
		Status:          models.OrderStatusPending,
		DeliveryAddress: req.DeliveryAddress,
		Notes:           req.Notes,
	}

	var total float64

	for _, reqItem := range req.Items {
		if reqItem.Quantity <= 0 {
			return nil, fmt.Errorf("quantity must be positive for cake %d", reqItem.CakeID)
		}

		cake, err := s.cakeRepo.GetByID(reqItem.CakeID)
		if err != nil {
			return nil, fmt.Errorf("looking up cake %d: %w", reqItem.CakeID, err)
		}
		if cake == nil {
			return nil, fmt.Errorf("cake %d not found", reqItem.CakeID)
		}
		if !cake.IsAvailable {
			return nil, fmt.Errorf("cake %d is not available", reqItem.CakeID)
		}

		unitPrice := cake.BasePrice

		if reqItem.CakeVariantID != nil {
			var matched *models.CakeVariant
			for i := range cake.Variants {
				if cake.Variants[i].ID == *reqItem.CakeVariantID {
					matched = &cake.Variants[i]
					break
				}
			}
			if matched == nil {
				return nil, fmt.Errorf("variant %d not found for cake %d", *reqItem.CakeVariantID, reqItem.CakeID)
			}
			unitPrice = matched.Price(cake.BasePrice)
		}

		subtotal := unitPrice * float64(reqItem.Quantity)
		total += subtotal

		order.Items = append(order.Items, models.OrderItem{
			CakeID:        reqItem.CakeID,
			CakeVariantID: reqItem.CakeVariantID,
			Quantity:      reqItem.Quantity,
			UnitPrice:     unitPrice,
			CustomMessage: reqItem.CustomMessage,
			Subtotal:      subtotal,
		})
	}

	order.TotalAmount = total

	orderID, err := s.orderRepo.Create(order)
	if err != nil {
		return nil, fmt.Errorf("creating order: %w", err)
	}
	order.ID = orderID

	s.notifyOrderConfirmed(*order)

	return order, nil
}

func (s *OrderService) notifyOrderConfirmed(order models.Order) {
	if s.whatsapp == nil {
		return
	}

	customer, err := s.customerRepo.GetByID(order.CustomerID)
	if err != nil {
		log.Printf("looking up customer %d for order confirmation: %v", order.CustomerID, err)
		return
	}
	if customer == nil {
		log.Printf("customer %d not found for order confirmation", order.CustomerID)
		return
	}

	if err := s.whatsapp.NotifyOrderConfirmed(*customer, order); err != nil {
		log.Printf("sending order confirmation for order %d: %v", order.ID, err)
	}
}

func (s *OrderService) GetOrder(id int64) (*models.Order, error) {
	order, err := s.orderRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("getting order %d: %w", id, err)
	}
	if order == nil {
		return nil, fmt.Errorf("order %d not found", id)
	}
	return order, nil
}

func (s *OrderService) ListCustomerOrders(customerID int64) ([]models.Order, error) {
	orders, err := s.orderRepo.ListByCustomer(customerID)
	if err != nil {
		return nil, fmt.Errorf("listing orders for customer %d: %w", customerID, err)
	}
	return orders, nil
}

func (s *OrderService) UpdateStatus(id int64, status models.OrderStatus) error {
	if err := s.orderRepo.UpdateStatus(id, status); err != nil {
		return fmt.Errorf("updating order %d status: %w", id, err)
	}

	order, err := s.orderRepo.GetByID(id)
	if err == nil && order != nil {
		s.notifyStatusChanged(*order)
	}

	return nil
}

func (s *OrderService) notifyStatusChanged(order models.Order) {
	if s.whatsapp == nil {
		return
	}

	customer, err := s.customerRepo.GetByID(order.CustomerID)
	if err != nil || customer == nil {
		return
	}

	if err := s.whatsapp.NotifyOrderStatusChanged(*customer, order); err != nil {
		log.Printf("sending status update for order %d: %v", order.ID, err)
	}
}

func (s *OrderService) ListAllOrders() ([]models.Order, error) {
	return s.orderRepo.ListAll()
}
