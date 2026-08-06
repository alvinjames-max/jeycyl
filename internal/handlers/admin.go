package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
	"github.com/alvinjames-max/jeycyl/internal/services"
)

type AdminHandler struct {
	cakeRepo     *repository.CakeRepository
	orderService *services.OrderService
}

func NewAdminHandler(cakeRepo *repository.CakeRepository, orderService *services.OrderService) *AdminHandler {
	return &AdminHandler{
		cakeRepo:     cakeRepo,
		orderService: orderService,
	}
}

type createCakeRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description,omitempty"`
	BasePrice   float64 `json:"base_price"`
	ImageURL    string  `json:"image_url,omitempty"`
}

func (h *AdminHandler) CreateCake(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req createCakeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	cake := &models.Cake{
		Name:        req.Name,
		Description: req.Description,
		BasePrice:   req.BasePrice,
		ImageURL:    req.ImageURL,
		IsAvailable: true,
	}

	id, err := h.cakeRepo.Create(cake)
	if err != nil {
		log.Printf("creating cake: %v", err)
		http.Error(w, "failed to create cake", http.StatusInternalServerError)
		return
	}
	cake.ID = id

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(cake); err != nil {
		log.Printf("encoding cake response: %v", err)
	}
}

type setAvailabilityRequest struct {
	Available bool `json:"available"`
}

func (h *AdminHandler) SetCakeAvailability(w http.ResponseWriter, r *http.Request, cakeID int64) {
	if r.Method != http.MethodPatch {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req setAvailabilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.cakeRepo.SetAvailability(cakeID, req.Available); err != nil {
		log.Printf("setting availability for cake %d: %v", cakeID, err)
		http.Error(w, "failed to update cake", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

type updateOrderStatusRequest struct {
	Status string `json:"status"`
}

func (h *AdminHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request, orderID int64) {
	if r.Method != http.MethodPatch {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req updateOrderStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.orderService.UpdateStatus(orderID, models.OrderStatus(req.Status)); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
