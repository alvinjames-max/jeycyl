package models

import "time"

type Cake struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	BasePrice   float64   `json:"base_price"`
	ImageURL    string    `json:"image_url,omitempty"`
	IsAvailable bool      `json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`

	Variants []CakeVariant `json:"variants,omitempty"`
}

type CakeVariant struct {
	ID            int64   `json:"id"`
	CakeID        int64   `json:"cake_id"`
	Size          string  `json:"size"`
	Flavor        string  `json:"flavor,omitempty"`
	PriceModifier float64 `json:"price_modifier"`
}

func (v CakeVariant) Price(basePrice float64) float64 {
	return basePrice + v.PriceModifier
}
