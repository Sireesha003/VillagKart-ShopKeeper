-- stores
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  manager_name VARCHAR(100),
  operating_hours VARCHAR(100),
  rating DECIMAL(2,1) DEFAULT 4.5,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  barcode VARCHAR(100),
  price DECIMAL(10,2),
  category VARCHAR(100),
  aisle_location VARCHAR(50),
  image_url TEXT,
  stock_qty INTEGER DEFAULT 0
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  store_id INTEGER REFERENCES stores(id),
  customer_id INTEGER REFERENCES customers(id),
  order_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  payment_method VARCHAR(50),
  total_value DECIMAL(10,2),
  sla_minutes INTEGER DEFAULT 30,
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  sla_breach BOOLEAN DEFAULT false,
  tray_number VARCHAR(10),
  picker_id INTEGER,
  packer_id INTEGER,
  accepted_at TIMESTAMP,
  picking_started_at TIMESTAMP,
  picking_completed_at TIMESTAMP,
  packing_started_at TIMESTAMP,
  packing_completed_at TIMESTAMP,
  dispatched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  picked_qty INTEGER DEFAULT 0,
  is_picked BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false
);

-- packing_trays
CREATE TABLE IF NOT EXISTS packing_trays (
  id SERIAL PRIMARY KEY,
  tray_number VARCHAR(10) UNIQUE,
  store_id INTEGER REFERENCES stores(id),
  is_active BOOLEAN DEFAULT false,
  current_order_id INTEGER REFERENCES orders(id)
);

-- returns
CREATE TABLE IF NOT EXISTS returns (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  reason VARCHAR(200),
  status VARCHAR(50) DEFAULT 'pending',
  refund_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- sla_logs
CREATE TABLE IF NOT EXISTS sla_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  event VARCHAR(100),
  expected_time TIMESTAMP,
  actual_time TIMESTAMP,
  breach BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- staff
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  name VARCHAR(100),
  role VARCHAR(50),
  initials VARCHAR(5),
  phone VARCHAR(20)
);
