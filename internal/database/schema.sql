-- internal/database/schema.sql

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,     -- used for WhatsApp integration
    email TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cake_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cake_id INTEGER NOT NULL REFERENCES cakes(id) ON DELETE CASCADE,
    size TEXT NOT NULL,             -- e.g. "small", "1kg", "2kg"
    flavor TEXT,                    -- e.g. "vanilla", "chocolate"
    price_modifier REAL NOT NULL DEFAULT 0,  -- added/subtracted from base_price
    UNIQUE(cake_id, size, flavor)
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, confirmed, paid, in_progress, ready, delivered, cancelled
    delivery_date DATETIME,
    delivery_address TEXT,
    notes TEXT,
    total_amount REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    cake_id INTEGER NOT NULL REFERENCES cakes(id),
    cake_variant_id INTEGER REFERENCES cake_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,       -- snapshot at time of order (price may change later)
    custom_message TEXT,            -- e.g. "Happy Birthday Jane" written on cake
    subtotal REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    amount REAL NOT NULL,
    method TEXT NOT NULL,           -- e.g. "mpesa", "cash", "card"
    transaction_ref TEXT,           -- M-Pesa receipt number, etc.
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);