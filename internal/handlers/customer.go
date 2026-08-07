package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
)

type CustomerHandler struct {
	customerRepo *repository.CustomerRepository
}

func NewCustomerHandler(customerRepo *repository.CustomerRepository) *CustomerHandler {
	return &CustomerHandler{customerRepo: customerRepo}
}

type createCustomerRequest struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Email   string `json:"email,omitempty"`
	Address string `json:"address,omitempty"`
}

func (h *CustomerHandler) CreateCustomer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req createCustomerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}
	if req.Phone == "" {
		http.Error(w, "phone is required", http.StatusBadRequest)
		return
	}

	existing, err := h.customerRepo.GetByPhone(req.Phone)
	if err != nil {
		log.Printf("checking existing customer by phone: %v", err)
		http.Error(w, "failed to create customer", http.StatusInternalServerError)
		return
	}
	if existing != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(existing); err != nil {
			log.Printf("encoding existing customer response: %v", err)
		}
		return
	}

	customer := &models.Customer{
		Name:    req.Name,
		Phone:   req.Phone,
		Email:   req.Email,
		Address: req.Address,
	}

	id, err := h.customerRepo.Create(customer)
	if err != nil {
		log.Printf("creating customer: %v", err)
		http.Error(w, "failed to create customer", http.StatusInternalServerError)
		return
	}
	customer.ID = id

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(customer); err != nil {
		log.Printf("encoding customer response: %v", err)
	}
}

func (h *CustomerHandler) GetCustomer(w http.ResponseWriter, r *http.Request, id int64) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	customer, err := h.customerRepo.GetByID(id)
	if err != nil {
		log.Printf("getting customer %d: %v", id, err)
		http.Error(w, "failed to load customer", http.StatusInternalServerError)
		return
	}
	if customer == nil {
		http.Error(w, "customer not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(customer); err != nil {
		log.Printf("encoding customer response: %v", err)
	}
}
