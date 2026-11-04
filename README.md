# Jeycyl Cakes — Full-Stack Bakery Platform

A modern, full-stack celebration cake ordering and management platform for **Jeycyl Cakes** (Nairobi, Kenya). Features a luxury aesthetic Next.js 16 frontend paired with a high-performance, containerized Go REST API backend and embedded SQLite storage.

---

## 🏗 Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │          Next.js 16 Frontend            │
                      │  App Router • Tailwind CSS • Turbopack  │
                      └────────────────────┬────────────────────┘
                                           │ HTTP / JSON
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │           Go REST API Backend           │
                      │ net/http • HMAC Auth • SQLite Database  │
                      └────────────────────┬────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
             ┌─────────────────────┐               ┌─────────────────────┐
             │   SQLite Database   │               │   WhatsApp Alerts   │
             │     (orders.db)     │               │  (Notification API) │
             └─────────────────────┘               └─────────────────────┘
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React icons, Fraunces serif & Work Sans typography.
- **Backend**: Go 1.25+, standard library `net/http` router, pure-Go SQLite (`modernc.org/sqlite` — zero CGO), HMAC-SHA256 session tokens & HTTP-only cookies.
- **Media & Storage**: Local image uploads served securely via `/uploads/` and SQLite for transactional consistency.

---

## 🎂 Features

### 🛒 Customer Experience
- **Interactive Cake Catalog**: Browse celebration cakes with live search, price display in Kenyan Shillings (KES), and scalloped frosting visuals.
- **Menu Filter Catalog (`/menu`)**: Dedicated filterable menu categorizing cakes by *Birthday Classics*, *Wedding & Anniversary*, *Rich Chocolate*, and *Velvet & Berry*.
- **Cake Customizer Modal**: Select size variants (1kg, 1.5kg, 2kg, etc.), cake flavors (Vanilla, Red Velvet, Chocolate Fudge, etc.), and custom piped inscriptions.
- **Shopping Cart & Checkout (`/cart`)**: Persistent cart context, Nairobi delivery address inputs, and real-time subtotal calculations.
- **Lipa na M-Pesa Confirmation (`/order-confirmation`)**: Instant order summary, Lipa na M-Pesa Buy Goods instructions (Till: 987654), and direct transaction code submission.
- **Live Order Tracking (`/track`)**: Public order lookup by order ID with a visual 6-stage milestone tracker (*Received → Confirmed → Paid → In the Oven → Ready → Delivered*).

### 🛡️ Bakery Staff Admin Portal (`/admin`)
- **Secure Authentication (`/admin/login`)**: Cookie/token-based HMAC sessions with password hashing.
- **Order Management**: Filter orders by status, inspect customer line items, review custom cake inscriptions, and update fulfillment stages.
- **Cake Catalog Manager**: Create cakes with size/flavor variants, toggle availability, upload product photos, and delete cakes with confirmation.
- **Customer Directory**: View customer profiles, contact numbers, email addresses, delivery locations, and order histories.

---

## 📂 Frontend Routes

| Route | Page Name | Purpose |
| :--- | :--- | :--- |
| `/` | **Home** | Hero banner, story, highlights, and featured cake catalog with customizer. |
| `/menu` | **Full Menu** | Filterable catalog by categories (*Birthday*, *Wedding*, *Chocolate*, *Velvet*). |
| `/cart` | **Cart & Checkout** | Cart review, customer contact information, and order placement. |
| `/order-confirmation` | **Confirmation** | Order receipt, M-Pesa payment prompt, and direct link to WhatsApp & tracking. |
| `/track` | **Order Tracking** | Public tracking timeline by order number with live status badges. |
| `/admin/login` | **Admin Login** | Secure staff login with credential validation. |
| `/admin` | **Admin Dashboard** | Manage active orders, customer database, and cake catalog inventory. |

---

## 📡 Backend API Endpoints

### Public & Customer Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check (`200 OK`) |
| `GET` | `/cakes` | List all available celebration cakes & variants |
| `GET` | `/cakes/{id}` | Get cake details, base price, and variant options |
| `POST` | `/pricing/preview` | Preview pricing calculation for cart items |
| `POST` | `/customers` | Register or lookup customer by phone number |
| `GET` | `/customers/{id}` | Get customer profile details |
| `GET` | `/customers/{customerID}/orders` | List order history for a specific customer |
| `POST` | `/orders` | Place a new cake order with line items |
| `GET` | `/orders/{id}` | Retrieve order details, items, and status |
| `POST` | `/payments` | Record payment transaction (M-Pesa, Cash, Card) |
| `GET` | `/orders/{id}/payments` | List payments recorded for an order |

### Auth & Staff Admin Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Staff login, returns HMAC session token & cookie |
| `POST` | `/auth/logout` | Public | Logout staff session and clear cookies |
| `GET` | `/admin/orders` | Admin | List all orders with line items and customer info |
| `POST` | `/admin/cakes` | Admin | Create a new cake (supports variants array) |
| `DELETE` | `/admin/cakes/{id}` | Admin | Delete a cake and its associated variants |
| `PATCH` | `/admin/cakes/{id}` | Admin | Toggle cake availability (`is_available`) |
| `POST` | `/admin/cakes/{id}/image` | Admin | Upload product photography (JPEG/PNG/WebP) |
| `PATCH` | `/admin/orders/{id}/status` | Admin | Advance order stage (`pending` → `delivered`) |
| `GET` | `/admin/customers` | Admin | List all registered customers and contact info |

---

## ⚙️ Getting Started

### Prerequisites
- **Go**: 1.25+ installed
- **Node.js**: v20+ & npm installed
- **Git**

---

### 1. Backend Setup

```bash
# 1. Navigate to root repository
cd /path/to/jeycyl

# 2. Run backend tests to verify environment
go test -v ./...

# 3. Seed an admin account (username: admin, default password printed in terminal)
go run cmd/seed/main.go -username=admin

# 4. (Optional) Seed initial bakery cake catalog
go run cmd/seed_cakes/main.go

# 5. Start the Go API server
go run cmd/server/main.go
```
The backend API starts on **`http://localhost:8080`**.

---

### 2. Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Verify .env.local configuration
# Default points to: NEXT_PUBLIC_API_URL=http://localhost:8080

# 4. Start Next.js development server
npm run dev
```
The frontend application will be live at **`http://localhost:3000`**.

---

### 3. Docker Deployment

To spin up the containerized backend with persistent SQLite storage:

```bash
# Build and run containers in background
docker-compose up --build -d

# Check status & logs
docker-compose ps
docker-compose logs -f app
```

---

## 🧪 Testing & Quality Checks

```bash
# Run all Go backend unit, repository, and integration tests
go test -v ./...

# Run Next.js linting
npm --prefix frontend run lint

# Run Next.js production build check
npm --prefix frontend run build
```

---

## 📜 License
Private & Proprietary — Jeycyl Cakes, Nairobi.
