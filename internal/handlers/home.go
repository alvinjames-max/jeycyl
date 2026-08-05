package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/alvinjames-max/jeycyl/internal/repository"
)

type HomeHandler struct {
	cakeRepo *repository.CakeRepository
}

func NewHomeHandler(cakeRepo *repository.CakeRepository) *HomeHandler {
	return &HomeHandler{cakeRepo: cakeRepo}
}

func (h *HomeHandler) ListCakes(w http.ResponseWriter, r *http.Request) {
	cakes, err := h.cakeRepo.ListAvailable()
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cakes)
}

func (h *HomeHandler) GetCake(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid cake id", http.StatusBadRequest)
		return
	}

	cake, err := h.cakeRepo.GetByID(id)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if cake == nil {
		http.Error(w, "cake not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cake)
}
