# Jeycyl Cakes Backend API

A high-performance, containerized Go REST API server for **Jeycyl Cakes** with SQLite embedded storage, token/cookie session authentication, price calculation, order management, payment tracking, image upload, and optional WhatsApp notifications.

---

## 🚀 Features

- **Cake Catalog & Pricing Engine**: Fetch available cake items, variants (sizes, flavors), and calculate subtotal/total prices dynamically.
- **Order Management System**: Place orders with customer details, order items, custom cake messages, and track status (`pending`, `confirmed`, `paid`, `in_progress`, `ready`, `delivered`, `cancelled`).
- **Customer Directory**: Automatic customer registration/lookup by phone number.
- **Payment Processing**: Record payment details (`mpesa`, `cash`, `card`) and auto-update order status to `paid`.
- **Admin Portal & Auth**: HMAC-signed token/cookie authentication, admin account seeding tool, image upload for cakes, and admin order listing.
- **WhatsApp Automated Notifications**: Triggers notification messages when orders are confirmed or status updates.
- **Pure-Go SQLite**: Built with `modernc.org/sqlite` — zero CGO requirement for fast, cross-platform compilation.

---

## 🛠 Tech Stack

- **Language**: Go 1.25+
- **Database**: SQLite (via `modernc.org/sqlite`)
- **Authentication**: HMAC-SHA256 Token & HTTP-Only Cookie
- **Containerization**: Docker (multi-stage minimal Alpine build) & Docker Compose

---

## 📂 API Endpoints

### Public / Customer Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check (`200 OK`) |
| `GET` | `/cakes` | List all available cakes |
| `GET` | `/cakes/{id}` | Get specific cake details & variants |
| `POST` | `/pricing/preview` | Preview pricing calculation for cart items |
| `POST` | `/customers` | Register or fetch customer by phone |
| `GET` | `/customers/{id}` | Get customer details |
| `GET` | `/customers/{customerID}/orders` | List order history for a customer |
| `POST` | `/orders` | Place a new cake order |
| `GET` | `/orders/{id}` | Retrieve order details & line items |
| `POST` | `/payments` | Record a payment for an order |
| `GET` | `/orders/{id}/payments` | List payments recorded for an order |

### Auth & Admin Endpoints (Requires Admin Session Token/Cookie)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | No | Login admin and receive session token / cookie |
| `POST` | `/auth/logout` | No | Logout admin and clear session cookie |
| `GET` | `/admin/orders` | Yes | List all customer orders |
| `POST` | `/admin/cakes` | Yes | Create a new cake item |
| `PATCH` | `/admin/cakes/{id}` | Yes | Toggle cake availability |
| `POST` | `/admin/cakes/{id}/image` | Yes | Upload cake image |
| `PATCH` | `/admin/orders/{id}/status` | Yes | Update order status |

---

## ⚙️ Quick Start

### 1. Run Locally

```bash
# Run unit & integration tests
go test -v ./...

# Seed an admin user
go run cmd/seed/main.go -username=admin

# Start server
go run cmd/server/main.go
```

The server will start at `http://localhost:8080`.

### 2. Run with Docker Compose

```bash
# Build and run container
docker-compose up --build -d
```

---

## 🧪 Testing

Run all unit, repository, service, and HTTP handler integration tests:

```bash
go test -v ./...
```
