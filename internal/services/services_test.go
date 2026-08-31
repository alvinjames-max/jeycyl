package services_test

import (
	"path/filepath"
	"testing"

	"github.com/alvinjames-max/jeycyl/internal/database"
	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
	"github.com/alvinjames-max/jeycyl/internal/services"
)

func TestOrderAndPaymentServices(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "services_test.db")
	db, err := database.New(dbPath)
	if err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	defer db.Close()

	cakeRepo := repository.NewCakeRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	customerRepo := repository.NewCustomerRepository(db)
	whatsappService := services.NewWhatsAppService("", "")

	orderService := services.NewOrderService(orderRepo, cakeRepo, customerRepo, whatsappService)
	paymentService := services.NewPaymentService(db, orderRepo)

	// Create a cake
	cakeID, err := cakeRepo.Create(&models.Cake{
		Name:        "Chocolate Fudge",
		BasePrice:   2500.0,
		IsAvailable: true,
	})
	if err != nil {
		t.Fatalf("failed to create cake: %v", err)
	}

	// Create a customer
	custID, err := customerRepo.Create(&models.Customer{
		Name:  "John Smith",
		Phone: "+254700000000",
	})
	if err != nil {
		t.Fatalf("failed to create customer: %v", err)
	}

	// Place an order
	order, err := orderService.PlaceOrder(services.PlaceOrderRequest{
		CustomerID:      custID,
		DeliveryAddress: "Westlands, Nairobi",
		Notes:           "Deliver before noon",
		Items: []services.OrderItemRequest{
			{
				CakeID:        cakeID,
				Quantity:      2,
				CustomMessage: "Happy Birthday!",
			},
		},
	})
	if err != nil {
		t.Fatalf("failed to place order: %v", err)
	}

	if order.TotalAmount != 5000.0 {
		t.Errorf("expected total amount 5000.0, got %.2f", order.TotalAmount)
	}
	if order.Status != models.OrderStatusPending {
		t.Errorf("expected initial status pending, got %s", order.Status)
	}

	// Record payment
	payment, err := paymentService.RecordPayment(services.RecordPaymentRequest{
		OrderID:        order.ID,
		Amount:         5000.0,
		Method:         models.PaymentMethodMpesa,
		TransactionRef: "QWX12345678",
	})
	if err != nil {
		t.Fatalf("failed to record payment: %v", err)
	}

	if payment.Status != models.PaymentStatusCompleted {
		t.Errorf("expected payment status completed, got %s", payment.Status)
	}

	// Check updated order status
	updatedOrder, err := orderService.GetOrder(order.ID)
	if err != nil {
		t.Fatalf("failed to get order: %v", err)
	}
	if updatedOrder.Status != models.OrderStatusPaid {
		t.Errorf("expected order status paid, got %s", updatedOrder.Status)
	}

	payments, err := paymentService.GetPaymentsForOrder(order.ID)
	if err != nil || len(payments) != 1 {
		t.Fatalf("expected 1 payment record, got %d (err: %v)", len(payments), err)
	}
}
