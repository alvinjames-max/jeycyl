package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/alvinjames-max/jeycyl/internal/services"
)

type OrderHandler struct {
	orderService *services.OrderService
}

func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

type placeOrderItemRequest struct {
	CakeID        int64  `json:"cake_id"`
	CakeVariantID *int64 `json:"cake_variant_id,omitempty"`
	Quantity      int    `json:"quantity"`
	CustomMessage string `json:"custom_message,omitempty"`
}

type placeOrderRequest struct {
	CustomerID      int64                   `json:"customer_id"`
	DeliveryAddress string                  `json:"delivery_address"`
	Notes           string                  `json:"notes,omitempty"`
	Items           []placeOrderItemRequest `json:"items"`
}

func (h *OrderHandler) PlaceOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req placeOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.CustomerID == 0 {
		http.Error(w, "customer_id is required", http.StatusBadRequest)
		return
	}

	items := make([]services.OrderItemRequest, len(req.Items))
	for i, item := range req.Items {
		items[i] = services.OrderItemRequest{
			CakeID:        item.CakeID,
			CakeVariantID: item.CakeVariantID,
			Quantity:      item.Quantity,
			CustomMessage: item.CustomMessage,
		}
	}

	order, err := h.orderService.PlaceOrder(services.PlaceOrderRequest{
		CustomerID:      req.CustomerID,
		DeliveryAddress: req.DeliveryAddress,
		Notes:           req.Notes,
		Items:           items,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid order id", http.StatusBadRequest)
		return
	}

	order, err := h.orderService.GetOrder(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

func (h *OrderHandler) ListCustomerOrders(w http.ResponseWriter, r *http.Request) {
	customerID, err := strconv.ParseInt(r.PathValue("customerID"), 10, 64)
	if err != nil {
		http.Error(w, "invalid customer id", http.StatusBadRequest)
		return
	}

	orders, err := h.orderService.ListCustomerOrders(customerID)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}
