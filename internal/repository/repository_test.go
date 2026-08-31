package repository_test

import (
	"path/filepath"
	"testing"

	"github.com/alvinjames-max/jeycyl/internal/database"
	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
)

func TestRepositories(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test.db")
	db, err := database.New(dbPath)
	if err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	defer db.Close()

	// 1. Admin Repository
	adminRepo := repository.NewAdminRepository(db)
	adminID, err := adminRepo.Create(&models.Admin{
		Username:     "admin",
		PasswordHash: "hashedpass",
	})
	if err != nil {
		t.Fatalf("creating admin failed: %v", err)
	}
	admin, err := adminRepo.GetByUsername("admin")
	if err != nil || admin == nil {
		t.Fatalf("getting admin failed: %v", err)
	}
	if admin.ID != adminID {
		t.Errorf("expected admin ID %d, got %d", adminID, admin.ID)
	}

	// 2. Cake Repository
	cakeRepo := repository.NewCakeRepository(db)
	cakeID, err := cakeRepo.Create(&models.Cake{
		Name:        "Red Velvet",
		Description: "Delicious Red Velvet Cake",
		BasePrice:   3500.0,
		IsAvailable: true,
	})
	if err != nil {
		t.Fatalf("creating cake failed: %v", err)
	}
	cakes, err := cakeRepo.ListAvailable()
	if err != nil || len(cakes) != 1 {
		t.Fatalf("expected 1 cake, got %d (err: %v)", len(cakes), err)
	}
	cake, err := cakeRepo.GetByID(cakeID)
	if err != nil || cake == nil {
		t.Fatalf("getting cake by id failed: %v", err)
	}
	if cake.Name != "Red Velvet" {
		t.Errorf("expected cake name 'Red Velvet', got %s", cake.Name)
	}

	// 3. Customer Repository
	custRepo := repository.NewCustomerRepository(db)
	custID, err := custRepo.Create(&models.Customer{
		Name:    "Jane Doe",
		Phone:   "+254712345678",
		Email:   "jane@example.com",
		Address: "Nairobi, Kenya",
	})
	if err != nil {
		t.Fatalf("creating customer failed: %v", err)
	}
	customer, err := custRepo.GetByPhone("+254712345678")
	if err != nil || customer == nil || customer.ID != custID {
		t.Fatalf("getting customer by phone failed: %v", err)
	}

	// 4. Order Repository
	orderRepo := repository.NewOrderRepository(db)
	orderID, err := orderRepo.Create(&models.Order{
		CustomerID:      custID,
		Status:          models.OrderStatusPending,
		DeliveryAddress: "Nairobi, Kenya",
		TotalAmount:     3500.0,
		Items: []models.OrderItem{
			{
				CakeID:    cakeID,
				Quantity:  1,
				UnitPrice: 3500.0,
				Subtotal:  3500.0,
			},
		},
	})
	if err != nil {
		t.Fatalf("creating order failed: %v", err)
	}

	order, err := orderRepo.GetByID(orderID)
	if err != nil || order == nil {
		t.Fatalf("getting order failed: %v", err)
	}
	if len(order.Items) != 1 {
		t.Errorf("expected 1 order item, got %d", len(order.Items))
	}

	allOrders, err := orderRepo.ListAll()
	if err != nil || len(allOrders) != 1 {
		t.Fatalf("expected 1 order in ListAll, got %d (err: %v)", len(allOrders), err)
	}

	err = orderRepo.UpdateStatus(orderID, models.OrderStatusPaid)
	if err != nil {
		t.Fatalf("updating order status failed: %v", err)
	}

	updatedOrder, _ := orderRepo.GetByID(orderID)
	if updatedOrder.Status != models.OrderStatusPaid {
		t.Errorf("expected status 'paid', got %s", updatedOrder.Status)
	}
}
