package middleware

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type contextKey string

const adminIDContextKey contextKey = "adminID"

const sessionCookieName = "jeycyl_session"
const sessionDuration = 24 * time.Hour

func GenerateSessionToken(adminID int64, secret []byte) (string, error) {
	expiry := time.Now().Add(sessionDuration).Unix()
	payload := fmt.Sprintf("%d:%d", adminID, expiry)
	encodedPayload := base64.URLEncoding.EncodeToString([]byte(payload))

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(encodedPayload))
	signature := hex.EncodeToString(mac.Sum(nil))

	return encodedPayload + "." + signature, nil
}

func ValidateSessionToken(token string, secret []byte) (int64, error) {
	parts := strings.SplitN(token, ".", 2)
	if len(parts) != 2 {
		return 0, fmt.Errorf("malformed token")
	}
	encodedPayload, signature := parts[0], parts[1]

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(encodedPayload))
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(signature), []byte(expectedSignature)) {
		return 0, fmt.Errorf("invalid signature")
	}

	payloadBytes, err := base64.URLEncoding.DecodeString(encodedPayload)
	if err != nil {
		return 0, fmt.Errorf("decoding payload: %w", err)
	}

	payloadParts := strings.SplitN(string(payloadBytes), ":", 2)
	if len(payloadParts) != 2 {
		return 0, fmt.Errorf("malformed payload")
	}

	adminID, err := strconv.ParseInt(payloadParts[0], 10, 64)
	if err != nil {
		return 0, fmt.Errorf("parsing admin id: %w", err)
	}

	expiry, err := strconv.ParseInt(payloadParts[1], 10, 64)
	if err != nil {
		return 0, fmt.Errorf("parsing expiry: %w", err)
	}

	if time.Now().Unix() > expiry {
		return 0, fmt.Errorf("session expired")
	}

	return adminID, nil
}

func SetSessionCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(sessionDuration),
	})
}

func ClearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})
}

func RequireAuth(secret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var token string
			if cookie, err := r.Cookie(sessionCookieName); err == nil && cookie.Value != "" {
				token = cookie.Value
			} else {
				authHeader := r.Header.Get("Authorization")
				if strings.HasPrefix(authHeader, "Bearer ") {
					token = strings.TrimPrefix(authHeader, "Bearer ")
				}
			}

			if token == "" {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			adminID, err := ValidateSessionToken(token, secret)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), adminIDContextKey, adminID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireAdmin(secret []byte) func(http.Handler) http.Handler {
	return RequireAuth(secret)
}

func AdminIDFromContext(ctx context.Context) (int64, bool) {
	adminID, ok := ctx.Value(adminIDContextKey).(int64)
	return adminID, ok
}
