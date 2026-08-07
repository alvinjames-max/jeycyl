package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
	"github.com/alvinjames-max/jeycyl/internal/services"
)

type AdminHandler struct {
	cakeRepo     *repository.CakeRepository
	orderService *services.OrderService
	uploadDir    string
}

func NewAdminHandler(cakeRepo *repository.CakeRepository, orderService *services.OrderService, uploadDir string) *AdminHandler {
	return &AdminHandler{
		cakeRepo:     cakeRepo,
		orderService: orderService,
		uploadDir:    uploadDir,
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

const maxUploadSize = 5 << 20 // 5MB

var allowedImageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
}

func (h *AdminHandler) UploadCakeImage(w http.ResponseWriter, r *http.Request, cakeID int64) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cake, err := h.cakeRepo.GetByID(cakeID)
	if err != nil {
		log.Printf("looking up cake %d: %v", cakeID, err)
		http.Error(w, "failed to look up cake", http.StatusInternalServerError)
		return
	}
	if cake == nil {
		http.Error(w, "cake not found", http.StatusNotFound)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		http.Error(w, "image too large or invalid form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "image file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageExtensions[ext] {
		http.Error(w, "unsupported image type", http.StatusBadRequest)
		return
	}

	if err := os.MkdirAll(h.uploadDir, 0o755); err != nil {
		log.Printf("creating upload directory: %v", err)
		http.Error(w, "failed to save image", http.StatusInternalServerError)
		return
	}

	filename, err := randomFilename(ext)
	if err != nil {
		log.Printf("generating filename: %v", err)
		http.Error(w, "failed to save image", http.StatusInternalServerError)
		return
	}

	destPath := filepath.Join(h.uploadDir, filename)
	dest, err := os.Create(destPath)
	if err != nil {
		log.Printf("creating destination file: %v", err)
		http.Error(w, "failed to save image", http.StatusInternalServerError)
		return
	}
	defer dest.Close()

	if _, err := io.Copy(dest, file); err != nil {
		log.Printf("writing image file: %v", err)
		http.Error(w, "failed to save image", http.StatusInternalServerError)
		return
	}

	imageURL := "/uploads/" + filename
	if err := h.cakeRepo.SetImageURL(cakeID, imageURL); err != nil {
		log.Printf("updating cake %d image url: %v", cakeID, err)
		http.Error(w, "failed to update cake", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]string{"image_url": imageURL}); err != nil {
		log.Printf("encoding upload response: %v", err)
	}
}

func randomFilename(ext string) (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b) + ext, nil
}
