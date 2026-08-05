package handlers

import (
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
