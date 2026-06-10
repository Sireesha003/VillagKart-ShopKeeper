-- dummy seed data for villagkart

-- 1. Stores
INSERT INTO stores (id, name, location, manager_name, operating_hours, rating, is_open, created_at) VALUES 
(1, 'Hyderabad Store 01', 'Kondapur, Hyderabad', 'Rohit Singh', '6:00 AM - 11:00 PM', 4.8, true, NOW())
ON CONFLICT DO NOTHING;

-- 2. Staff
INSERT INTO staff (id, store_id, name, role, initials, phone) VALUES
(1, 1, 'Rohit Singh', 'manager', 'RS', '+91 98765 00001'),
(2, 1, 'Arjun Kumar', 'picker', 'AK', '+91 98765 00002'),
(3, 1, 'Meena Devi', 'packer', 'MD', '+91 98765 00003')
ON CONFLICT DO NOTHING;

-- 3. Customers
INSERT INTO customers (name, phone, address) VALUES
('Rahul Sharma',  '+91 98765 43210', 'Flat 4B, Green Park Apts, Kondapur'),
('Priya Mehta',   '+91 87654 32109', 'House 12, Madhapur Main Road'),
('Amir Khan',     '+91 76543 21098', '302 Cyber Towers, Hitech City'),
('Sunita Devi',   '+91 65432 10987', 'Banjara Hills, Road No 12'),
('Vikram Reddy',  '+91 54321 09876', 'Jubilee Hills, Plot 45');

-- 4. Products
INSERT INTO products (name, sku, barcode, price, category, aisle_location, stock_qty) VALUES
('Amul Milk 500ml',     'MILK001', '8901063024427', 28.00,  'Dairy',       'A1',  50),
('Bread Loaf',          'BRD001',  '8906001234567', 42.00,  'Bakery',      'B2',  30),
('Eggs 12pcs',          'EGG001',  '8901234567890', 75.00,  'Dairy',       'A2',  20),
('Surf Excel 1kg',      'DET001',  '8901030829023', 120.00, 'Household',   'C1',  25),
('Head & Shoulders',    'SHP001',  '8001090145215', 180.00, 'Personal',    'D1',  15),
('Nivea Face Wash',     'FCW001',  '4005900355683', 150.00, 'Personal',    'D2',  18),
('Basmati Rice 5kg',    'RCE001',  '8904267001234', 350.00, 'Staples',     'E1',  12),
('Toor Dal 1kg',        'DAL001',  '8904267005678', 120.00, 'Staples',     'E2',  20),
('Sunflower Oil 1L',    'OIL001',  '8901289034012', 140.00, 'Cooking',     'E3',  10),
('Lays Chips 52g',      'CHP001',  '8901491106940', 20.00,  'Snacks',      'F1',  40),
('Frooti 200ml',        'JCE001',  '8901063001190', 18.00,  'Beverages',   'G1',  35),
('Parle-G Biscuits',    'BSC001',  '8901719110153', 10.00,  'Snacks',      'F2',  60),
('Colgate 200g',        'TPT001',  '8901314002444', 90.00,  'Personal',    'D3',  22),
('Dettol Soap',         'SOP001',  '8901396012832', 40.00,  'Personal',    'D4',  30),
('Maggi 70g',           'MGI001',  '8901058856787', 14.00,  'Instant',     'F3',  45);

-- 5. Orders
INSERT INTO orders (order_number, store_id, customer_id, order_type, status, payment_method, total_value, sla_minutes, priority, tray_number, created_at) VALUES
('QC100245', 1, 1, 'Quick Commerce', 'new',      'Online Paid', 1240.00, 15, 'HIGH',   NULL,  NOW() - INTERVAL '2 minutes'),
('EC100246', 1, 2, 'E-Commerce',     'new',      'COD',          890.00, 45, 'MEDIUM', NULL,  NOW() - INTERVAL '8 minutes'),
('WA100247', 1, 3, 'WhatsApp',       'picking',  'Online Paid', 1080.00, 20, 'HIGH',   NULL,  NOW() - INTERVAL '15 minutes'),
('CC100248', 1, 4, 'Call Center',    'packing',  'COD',          420.00, 30, 'LOW',    'P03', NOW() - INTERVAL '22 minutes'),
('QC100249', 1, 5, 'Quick Commerce', 'ready',    'Online Paid',  760.00, 15, 'HIGH',   'P07', NOW() - INTERVAL '35 minutes'),
('EC100250', 1, 1, 'E-Commerce',     'dispatched','Online Paid', 1500.00, 45, 'MEDIUM', NULL, NOW() - INTERVAL '55 minutes'),
('WA100251', 1, 2, 'Self Pickup',    'new',      'COD',          320.00, 60, 'LOW',    NULL,  NOW() - INTERVAL '5 minutes'),
('CC100252', 1, 3, 'Call Center',    'new',      'COD',          580.00, 30, 'MEDIUM', NULL,  NOW() - INTERVAL '1 minute');

-- 6. Order Items
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 2), (1, 2, 1), (1, 3, 1), (1, 10, 3), (1, 11, 2),
(2, 4, 1), (2, 5, 1), (2, 6, 1),
(3, 7, 1), (3, 8, 1), (3, 9, 1), (3, 12, 2),
(4, 10, 2), (4, 11, 3), (4, 12, 1),
(5, 1, 1), (5, 13, 1), (5, 14, 2),
(6, 7, 2), (6, 8, 2), (6, 9, 1),
(7, 2, 1), (7, 15, 3),
(8, 4, 1), (8, 10, 1), (8, 5, 1);

-- 7. Packing Trays
INSERT INTO packing_trays (tray_number, store_id, is_active) VALUES
('P01', 1, false), ('P02', 1, false), ('P03', 1, true),
('P04', 1, false), ('P05', 1, false), ('P06', 1, false),
('P07', 1, true),  ('P08', 1, false), ('P09', 1, false), ('P10', 1, false);
