package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/services"
)

type PaymentHandler struct {
	paymentService *services.PaymentService
}

func NewPaymentHandler(paymentService *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

type recordPaymentRequest struct {
	OrderID        int64   `json:"order_id"`
	Amount         float64 `json:"amount"`
	Method         string  `json:"method"`
	TransactionRef string  `json:"transaction_ref,omitempty"`
}

func (h *PaymentHandler) RecordPayment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req recordPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	payment, err := h.paymentService.RecordPayment(services.RecordPaymentRequest{
		OrderID:        req.OrderID,
		Amount:         req.Amount,
		Method:         models.PaymentMethod(req.Method),
		TransactionRef: req.TransactionRef,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(payment); err != nil {
		log.Printf("encoding payment response: %v", err)
	}
}

func (h *PaymentHandler) GetPaymentsForOrder(w http.ResponseWriter, r *http.Request, orderID int64) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	payments, err := h.paymentService.GetPaymentsForOrder(orderID)
	if err != nil {
		log.Printf("listing payments for order %d: %v", orderID, err)
		http.Error(w, "failed to load payments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(payments); err != nil {
		log.Printf("encoding payments response: %v", err)
	}
}
