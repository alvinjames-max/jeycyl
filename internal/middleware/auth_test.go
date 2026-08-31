package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/alvinjames-max/jeycyl/internal/middleware"
)

func TestAuthMiddleware(t *testing.T) {
	secret := []byte("test-secret-key-12345")

	token, err := middleware.GenerateSessionToken(42, secret)
	if err != nil {
		t.Fatalf("unexpected error generating token: %v", err)
	}

	adminID, err := middleware.ValidateSessionToken(token, secret)
	if err != nil {
		t.Fatalf("unexpected error validating token: %v", err)
	}
	if adminID != 42 {
		t.Errorf("expected adminID 42, got %d", adminID)
	}

	// Test invalid secret
	_, err = middleware.ValidateSessionToken(token, []byte("wrong-secret"))
	if err == nil {
		t.Errorf("expected error with wrong secret, got nil")
	}

	// Test handler with Bearer token
	protectedHandler := middleware.RequireAdmin(secret)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id, ok := middleware.AdminIDFromContext(r.Context())
		if !ok || id != 42 {
			t.Errorf("expected admin ID 42 in context, got %d", id)
		}
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/admin/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()

	protectedHandler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
}

func TestCORSMiddleware(t *testing.T) {
	cors := middleware.CORS("http://localhost:3000")
	handler := cors(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodOptions, "/cakes", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200 for OPTIONS, got %d", rec.Code)
	}
	if origin := rec.Header().Get("Access-Control-Allow-Origin"); origin != "http://localhost:3000" {
		t.Errorf("expected header http://localhost:3000, got %s", origin)
	}
}
