package main

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/alvinjames-max/jeycyl/internal/database"
	"github.com/alvinjames-max/jeycyl/internal/handlers"
	"github.com/alvinjames-max/jeycyl/internal/middleware"
	"github.com/alvinjames-max/jeycyl/internal/repository"
	"github.com/alvinjames-max/jeycyl/internal/services"
)

func main() {
	dbPath := getEnv("DB_PATH", "./orders.db")
	port := getEnv("PORT", "8080")
	frontendOrigin := getEnv("FRONTEND_ORIGIN", "http://localhost:3000")
	uploadDir := getEnv("UPLOAD_DIR", "./uploads")
	sessionSecret := []byte(getEnv("SESSION_SECRET", "jeycyl-cakes-secret-key-change-me"))
	whatsappAPIURL := os.Getenv("WHATSAPP_API_URL")
	whatsappAPIToken := os.Getenv("WHATSAPP_API_TOKEN")

	db, err := database.New(dbPath)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}
	defer db.Close()
	log.Println("database ready at", dbPath)

	cakeRepo := repository.NewCakeRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	adminRepo := repository.NewAdminRepository(db)
	customerRepo := repository.NewCustomerRepository(db)

	whatsappService := services.NewWhatsAppService(whatsappAPIURL, whatsappAPIToken)
	orderService := services.NewOrderService(orderRepo, cakeRepo, customerRepo, whatsappService)
	paymentService := services.NewPaymentService(db, orderRepo)

	homeHandler := handlers.NewHomeHandler(cakeRepo)
	orderHandler := handlers.NewOrderHandler(orderService)
	pricingHandler := handlers.NewPricingHandler(cakeRepo)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	adminHandler := handlers.NewAdminHandler(cakeRepo, orderService, uploadDir)
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

	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadDir))))

	handler := middleware.CORS(frontendOrigin)(mux)

	log.Println("listening on port", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

func withID(param string, fn func(http.ResponseWriter, *http.Request, int64)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(r.PathValue(param), 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		fn(w, r, id)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
