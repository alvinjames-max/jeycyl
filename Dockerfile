# Multi-stage Dockerfile for Jeycyl Cakes Backend

# Stage 1: Build binary
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Copy dependency modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source files
COPY . .

# Build pure-Go server binary (CGO_ENABLED=0 using modernc.org/sqlite)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/seed ./cmd/seed

# Stage 2: Minimal runtime image
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Create upload & data directories
RUN mkdir -p /app/uploads /app/data

# Copy built binaries
COPY --from=builder /app/server /app/server
COPY --from=builder /app/seed /app/seed

ENV PORT=8080
ENV DB_PATH=/app/data/orders.db
ENV UPLOAD_DIR=/app/uploads
ENV FRONTEND_ORIGIN=http://localhost:3000

EXPOSE 8080

VOLUME ["/app/data", "/app/uploads"]

ENTRYPOINT ["/app/server"]
