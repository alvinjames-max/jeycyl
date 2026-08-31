package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"golang.org/x/crypto/bcrypt"

	"github.com/alvinjames-max/jeycyl/internal/database"
	"github.com/alvinjames-max/jeycyl/internal/handlers"
	"github.com/alvinjames-max/jeycyl/internal/middleware"
	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
	"github.com/alvinjames-max/jeycyl/internal/services"
)

func setupTestServer(t *testing.T) (http.Handler, *repository.AdminRepository, []byte) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "handlers_test.db")
	db, err := database.New(dbPath)
	if err != nil {
		t.Fatalf("failed to init db: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	sessionSecret := []byte("test-session-secret-999")
	cakeRepo := repository.NewCakeRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	adminRepo := repository.NewAdminRepository(db)
	customerRepo := repository.NewCustomerRepository(db)

	whatsappService := services.NewWhatsAppService("", "")
	orderService := services.NewOrderService(orderRepo, cakeRepo, customerRepo, whatsappService)
	paymentService := services.NewPaymentService(db, orderRepo)

	homeHandler := handlers.NewHomeHandler(cakeRepo)
	orderHandler := handlers.NewOrderHandler(orderService)
	pricingHandler := handlers.NewPricingHandler(cakeRepo)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	adminHandler := handlers.NewAdminHandler(cakeRepo, orderService, tempDir)
	authHandler := handlers.NewAuthHandler(adminRepo, sessionSecret)
	customerHandler := handlers.NewCustomerHandler(customerRepo)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	mux.HandleFunc("GET /cakes", homeHandler.ListCakes)
	mux.HandleFunc("GET /cakes/{id}", homeHandler.GetCake)

	mux.HandleFunc("POST /pricing/preview", pricingHandler.PreviewPrice)

	mux.HandleFunc("POST /orders", orderHandler.PlaceOrder)
	mux.HandleFunc("GET /orders/{id}", orderHandler.GetOrder)
	mux.HandleFunc("POST /customers", customerHandler.CreateCustomer)
	mux.HandleFunc("GET /customers/{id}", withID("id", customerHandler.GetCustomer))
	mux.HandleFunc("GET /customers/{customerID}/orders", orderHandler.ListCustomerOrders)

	mux.HandleFunc("POST /payments", paymentHandler.RecordPayment)
	mux.HandleFunc("GET /orders/{id}/payments", withID("id", paymentHandler.GetPaymentsForOrder))

	mux.HandleFunc("POST /auth/login", authHandler.Login)
	mux.HandleFunc("POST /auth/logout", authHandler.Logout)

	adminMux := http.NewServeMux()
	adminMux.HandleFunc("GET /admin/orders", adminHandler.ListOrders)
	adminMux.HandleFunc("POST /admin/cakes", adminHandler.CreateCake)
	adminMux.HandleFunc("PATCH /admin/cakes/{id}", withID("id", adminHandler.SetCakeAvailability))
	adminMux.HandleFunc("POST /admin/cakes/{id}/image", withID("id", adminHandler.UploadCakeImage))
	adminMux.HandleFunc("PATCH /admin/orders/{id}/status", withID("id", adminHandler.UpdateOrderStatus))
	mux.Handle("/admin/", middleware.RequireAdmin(sessionSecret)(adminMux))

	return middleware.CORS("http://localhost:3000")(mux), adminRepo, sessionSecret
}

func withID(param string, fn func(http.ResponseWriter, *http.Request, int64)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue(param)
		var id int64
		for _, c := range idStr {
			if c < '0' || c > '9' {
				http.Error(w, "invalid id", http.StatusBadRequest)
				return
			}
			id = id*10 + int64(c-'0')
		}
		fn(w, r, id)
	}
}

func TestFullHTTPFlow(t *testing.T) {
	handler, adminRepo, _ := setupTestServer(t)

	// 1. Health check
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK || rec.Body.String() != "ok" {
		t.Fatalf("health check failed: status %d, body %s", rec.Code, rec.Body.String())
	}

	// 2. Create seed admin
	hash, _ := bcrypt.GenerateFromPassword([]byte("adminpass123"), bcrypt.DefaultCost)
	adminRepo.Create(&models.Admin{
		Username:     "adminuser",
		PasswordHash: string(hash),
	})

	// 3. Login
	loginPayload := map[string]string{
		"username": "adminuser",
		"password": "adminpass123",
	}
	body, _ := json.Marshal(loginPayload)
	req = httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("login failed: status %d, body %s", rec.Code, rec.Body.String())
	}

	var loginResp struct {
		Status string `json:"status"`
		Token  string `json:"token"`
	}
	json.Unmarshal(rec.Body.Bytes(), &loginResp)
	if loginResp.Token == "" {
		t.Fatalf("expected token in login response, got empty")
	}

	// 4. Create cake via Admin API using Bearer Token
	cakePayload := map[string]interface{}{
		"name":       "Black Forest",
		"base_price": 2800.0,
	}
	body, _ = json.Marshal(cakePayload)
	req = httptest.NewRequest(http.MethodPost, "/admin/cakes", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+loginResp.Token)
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("admin create cake failed: status %d, body %s", rec.Code, rec.Body.String())
	}

	var createdCake models.Cake
	json.Unmarshal(rec.Body.Bytes(), &createdCake)
	if createdCake.ID == 0 || createdCake.Name != "Black Forest" {
		t.Fatalf("unexpected created cake: %+v", createdCake)
	}

	// 5. List available cakes
	req = httptest.NewRequest(http.MethodGet, "/cakes", nil)
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("list cakes failed: status %d", rec.Code)
	}
	var cakes []models.Cake
	json.Unmarshal(rec.Body.Bytes(), &cakes)
	if len(cakes) != 1 {
		t.Fatalf("expected 1 cake, got %d", len(cakes))
	}

	// 6. Create Customer
	custPayload := map[string]string{
		"name":  "Alice Smith",
		"phone": "+254711223344",
	}
	body, _ = json.Marshal(custPayload)
	req = httptest.NewRequest(http.MethodPost, "/customers", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("create customer failed: status %d, body %s", rec.Code, rec.Body.String())
	}
	var customer models.Customer
	json.Unmarshal(rec.Body.Bytes(), &customer)

	// 7. Place Order
	orderPayload := map[string]interface{}{
		"customer_id":      customer.ID,
		"delivery_address": "Kilimani, Nairobi",
		"items": []map[string]interface{}{
			{
				"cake_id":        createdCake.ID,
				"quantity":       1,
				"custom_message": "Happy 30th Birthday!",
			},
		},
	}
	body, _ = json.Marshal(orderPayload)
	req = httptest.NewRequest(http.MethodPost, "/orders", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("place order failed: status %d, body %s", rec.Code, rec.Body.String())
	}
	var placedOrder models.Order
	json.Unmarshal(rec.Body.Bytes(), &placedOrder)

	if placedOrder.TotalAmount != 2800.0 {
		t.Fatalf("expected order total 2800.0, got %.2f", placedOrder.TotalAmount)
	}

	// 8. Record Payment
	payPayload := map[string]interface{}{
		"order_id":        placedOrder.ID,
		"amount":          2800.0,
		"method":          "mpesa",
		"transaction_ref": "REF987654321",
	}
	body, _ = json.Marshal(payPayload)
	req = httptest.NewRequest(http.MethodPost, "/payments", bytes.NewReader(body))
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("record payment failed: status %d, body %s", rec.Code, rec.Body.String())
	}

	// 9. Admin list orders
	req = httptest.NewRequest(http.MethodGet, "/admin/orders", nil)
	req.Header.Set("Authorization", "Bearer "+loginResp.Token)
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("admin list orders failed: status %d", rec.Code)
	}
	var adminOrders []models.Order
	json.Unmarshal(rec.Body.Bytes(), &adminOrders)
	if len(adminOrders) != 1 || adminOrders[0].Status != models.OrderStatusPaid {
		t.Fatalf("expected 1 paid order in admin list, got %+v", adminOrders)
	}
}
