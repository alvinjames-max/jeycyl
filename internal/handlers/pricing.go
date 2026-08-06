package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/alvinjames-max/jeycyl/internal/repository"
)

type PricingHandler struct {
	cakeRepo *repository.CakeRepository
}

func NewPricingHandler(cakeRepo *repository.CakeRepository) *PricingHandler {
	return &PricingHandler{cakeRepo: cakeRepo}
}

type pricePreviewItemRequest struct {
	CakeID        int64  `json:"cake_id"`
	CakeVariantID *int64 `json:"cake_variant_id,omitempty"`
	Quantity      int    `json:"quantity"`
}

type pricePreviewRequest struct {
	Items []pricePreviewItemRequest `json:"items"`
}

type pricePreviewItemResponse struct {
	CakeID    int64   `json:"cake_id"`
	UnitPrice float64 `json:"unit_price"`
	Quantity  int     `json:"quantity"`
	Subtotal  float64 `json:"subtotal"`
}

type pricePreviewResponse struct {
	Items []pricePreviewItemResponse `json:"items"`
	Total float64                    `json:"total"`
}

func (h *PricingHandler) PreviewPrice(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req pricePreviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.computePreview(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		log.Printf("encoding price preview response: %v", err)
	}
}

func (h *PricingHandler) computePreview(req pricePreviewRequest) (*pricePreviewResponse, error) {
	var resp pricePreviewResponse

	for _, item := range req.Items {
		if item.Quantity <= 0 {
			return nil, fmt.Errorf("quantity must be positive for cake %d", item.CakeID)
		}

		cake, err := h.cakeRepo.GetByID(item.CakeID)
		if err != nil {
			return nil, fmt.Errorf("looking up cake %d: %w", item.CakeID, err)
		}
		if cake == nil {
			return nil, fmt.Errorf("cake %d not found", item.CakeID)
		}

		unitPrice := cake.BasePrice

		if item.CakeVariantID != nil {
			found := false
			for _, v := range cake.Variants {
				if v.ID == *item.CakeVariantID {
					unitPrice = v.Price(cake.BasePrice)
					found = true
					break
				}
			}
			if !found {
				return nil, fmt.Errorf("variant %d not found for cake %d", *item.CakeVariantID, item.CakeID)
			}
		}

		subtotal := unitPrice * float64(item.Quantity)
		resp.Items = append(resp.Items, pricePreviewItemResponse{
			CakeID:    item.CakeID,
			UnitPrice: unitPrice,
			Quantity:  item.Quantity,
			Subtotal:  subtotal,
		})
		resp.Total += subtotal
	}

	return &resp, nil
}
