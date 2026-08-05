package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/alvinjames-max/jeycyl/internal/models"
)

type WhatsAppService struct {
	apiURL     string
	apiToken   string
	httpClient *http.Client
}

func NewWhatsAppService(apiURL, apiToken string) *WhatsAppService {
	return &WhatsAppService{
		apiURL:   apiURL,
		apiToken: apiToken,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type whatsAppMessagePayload struct {
	To   string `json:"to"`
	Type string `json:"type"`
	Text struct {
		Body string `json:"body"`
	} `json:"text"`
}

func (s *WhatsAppService) SendMessage(phone, message string) error {
	payload := whatsAppMessagePayload{
		To:   phone,
		Type: "text",
	}
	payload.Text.Body = message

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshaling whatsapp payload: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, s.apiURL, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("building whatsapp request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("sending whatsapp message: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("whatsapp api returned status %d", resp.StatusCode)
	}

	return nil
}

func (s *WhatsAppService) NotifyOrderConfirmed(customer models.Customer, order models.Order) error {
	message := fmt.Sprintf(
		"Hi %s, your order #%d has been confirmed. Total: KES %.2f. We'll notify you as it progresses.",
		customer.Name, order.ID, order.TotalAmount,
	)
	return s.SendMessage(customer.Phone, message)
}

func (s *WhatsAppService) NotifyOrderStatusChanged(customer models.Customer, order models.Order) error {
	message := fmt.Sprintf(
		"Hi %s, your order #%d status has been updated to: %s.",
		customer.Name, order.ID, order.Status,
	)
	return s.SendMessage(customer.Phone, message)
}