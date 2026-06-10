import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to Supabase');
    console.log('📦 Creating schema...');

    await client.query(`
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

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        store_id INTEGER,
        name VARCHAR(100),
        role VARCHAR(50),
        initials VARCHAR(5),
        phone VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        store_id INTEGER,
        customer_id INTEGER,
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

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        picked_qty INTEGER DEFAULT 0,
        is_picked BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS packing_trays (
        id SERIAL PRIMARY KEY,
        tray_number VARCHAR(10) UNIQUE,
        store_id INTEGER,
        is_active BOOLEAN DEFAULT false,
        current_order_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS returns (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        reason VARCHAR(200),
        status VARCHAR(50) DEFAULT 'pending',
        refund_amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sla_logs (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        event VARCHAR(100),
        expected_time TIMESTAMP,
        actual_time TIMESTAMP,
        breach BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Schema ready');

    // Clear old data in dependency order
    console.log('🗑️  Clearing old data...');
    await client.query(`
      TRUNCATE sla_logs, returns, packing_trays, order_items, orders, staff, products, customers, stores RESTART IDENTITY CASCADE;
    `);

    // 1. Stores
    console.log('🏪 Seeding stores...');
    await client.query(`
      INSERT INTO stores (name, location, manager_name, operating_hours, rating, is_open) VALUES
      ('Hyderabad Store 01', 'Kondapur, Hyderabad', 'Rohit Singh', '6:00 AM - 11:00 PM', 4.8, true),
      ('Hyderabad Store 02', 'Madhapur, Hyderabad', 'Sunita Rao', '7:00 AM - 10:00 PM', 4.6, true),
      ('Hyderabad Store 03', 'Hitech City, Hyderabad', 'Arun Verma', '6:30 AM - 11:30 PM', 4.7, false);
    `);

    // 2. Customers
    console.log('👥 Seeding customers...');
    await client.query(`
      INSERT INTO customers (name, phone, address) VALUES
      ('Rahul Sharma',  '+91 98765 43210', 'Flat 4B, Green Park Apts, Kondapur'),
      ('Priya Mehta',   '+91 87654 32109', 'House 12, Madhapur Main Road'),
      ('Amir Khan',     '+91 76543 21098', '302 Cyber Towers, Hitech City'),
      ('Sunita Devi',   '+91 65432 10987', 'Banjara Hills, Road No 12'),
      ('Vikram Reddy',  '+91 54321 09876', 'Jubilee Hills, Plot 45'),
      ('Kavya Nair',    '+91 90123 45678', 'Gachibowli, Survey No 88'),
      ('Arjun Patel',   '+91 81234 56789', 'KPHB Colony, Phase 7'),
      ('Deepika Joshi', '+91 72345 67890', 'Ameerpet, Sri Nagar Colony');
    `);

    // 3. Products
    console.log('🛒 Seeding products...');
    await client.query(`
      INSERT INTO products (name, sku, barcode, price, category, aisle_location, stock_qty) VALUES
      ('Amul Milk 500ml',       'MILK001', '8901063024427', 28.00,  'Dairy',      'A1', 50),
      ('Amul Butter 100g',      'BTR001',  '8901063025423', 55.00,  'Dairy',      'A1', 35),
      ('Bread Loaf',            'BRD001',  '8906001234567', 42.00,  'Bakery',     'B2', 30),
      ('Brown Bread',           'BRD002',  '8906001234568', 55.00,  'Bakery',     'B2', 20),
      ('Eggs 12pcs',            'EGG001',  '8901234567890', 75.00,  'Dairy',      'A2', 20),
      ('Surf Excel 1kg',        'DET001',  '8901030829023', 120.00, 'Household',  'C1', 25),
      ('Vim Dishwash 500g',     'DSH001',  '8901030812010', 65.00,  'Household',  'C2', 18),
      ('Head & Shoulders 200ml','SHP001',  '8001090145215', 180.00, 'Personal',   'D1', 15),
      ('Nivea Face Wash 100ml', 'FCW001',  '4005900355683', 150.00, 'Personal',   'D2', 18),
      ('Basmati Rice 5kg',      'RCE001',  '8904267001234', 350.00, 'Staples',    'E1', 12),
      ('Toor Dal 1kg',          'DAL001',  '8904267005678', 120.00, 'Staples',    'E2', 20),
      ('Sunflower Oil 1L',      'OIL001',  '8901289034012', 140.00, 'Cooking',    'E3', 10),
      ('Lays Chips 52g',        'CHP001',  '8901491106940', 20.00,  'Snacks',     'F1', 40),
      ('Frooti 200ml',          'JCE001',  '8901063001190', 18.00,  'Beverages',  'G1', 35),
      ('Parle-G Biscuits 200g', 'BSC001',  '8901719110153', 10.00,  'Snacks',     'F2', 60),
      ('Colgate Total 200g',    'TPT001',  '8901314002444', 90.00,  'Personal',   'D3', 22),
      ('Dettol Soap 75g',       'SOP001',  '8901396012832', 40.00,  'Personal',   'D4', 30),
      ('Maggi 70g',             'MGI001',  '8901058856787', 14.00,  'Instant',    'F3', 45),
      ('Pepsi 750ml',           'PPS001',  '8901234500001', 40.00,  'Beverages',  'G2', 25),
      ('Coca Cola 750ml',       'CCL001',  '8901234500002', 40.00,  'Beverages',  'G2', 25),
      ('Haldiram Bhujia 200g',  'HLD001',  '8906003100001', 80.00,  'Snacks',     'F4', 15),
      ('Nestle KitKat 4F',      'KTK001',  '8901234600001', 30.00,  'Snacks',     'F5', 50),
      ('Tropicana OJ 1L',       'TRO001',  '8901234700001', 120.00, 'Beverages',  'G3', 12),
      ('Saffola Gold Oil 1L',   'SFG001',  '8901289010001', 160.00, 'Cooking',    'E4', 8),
      ('Atta 5kg Aashirvaad',   'ATT001',  '8901600000001', 250.00, 'Staples',    'E5', 15);
    `);

    // 4. Staff
    console.log('👷 Seeding staff...');
    await client.query(`
      INSERT INTO staff (store_id, name, role, initials, phone) VALUES
      (1, 'Rohit Singh',  'manager', 'RS', '+91 98765 00001'),
      (1, 'Arjun Kumar',  'picker',  'AK', '+91 98765 00002'),
      (1, 'Meena Devi',   'packer',  'MD', '+91 98765 00003'),
      (1, 'Suresh Naidu', 'picker',  'SN', '+91 98765 00004'),
      (2, 'Sunita Rao',   'manager', 'SR', '+91 98765 00005'),
      (2, 'Ravi Teja',    'picker',  'RT', '+91 98765 00006'),
      (3, 'Arun Verma',   'manager', 'AV', '+91 98765 00007');
    `);

    // 5. Orders
    console.log('📋 Seeding orders...');
    await client.query(`
      INSERT INTO orders (order_number, store_id, customer_id, order_type, status, payment_method, total_value, sla_minutes, priority, tray_number, picker_id, packer_id, accepted_at, picking_started_at, picking_completed_at, packing_started_at, dispatched_at, created_at) VALUES
      ('QC100245', 1, 1, 'Quick Commerce', 'new',        'Online Paid', 1240.00, 15, 'HIGH',   NULL,  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 minutes'),
      ('EC100246', 1, 2, 'E-Commerce',     'new',        'COD',          890.00, 45, 'MEDIUM', NULL,  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '8 minutes'),
      ('WA100247', 1, 3, 'WhatsApp',       'picking',    'Online Paid', 1080.00, 20, 'HIGH',   NULL,  2,    NULL, NOW() - INTERVAL '14 minutes', NOW() - INTERVAL '13 minutes', NULL, NULL, NULL, NOW() - INTERVAL '15 minutes'),
      ('CC100248', 1, 4, 'Call Center',    'packing',    'COD',          420.00, 30, 'LOW',    'P03', 2,    3,    NOW() - INTERVAL '21 minutes', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '14 minutes', NULL, NOW() - INTERVAL '22 minutes'),
      ('QC100249', 1, 5, 'Quick Commerce', 'ready',      'Online Paid',  760.00, 15, 'HIGH',   'P07', 4,    3,    NOW() - INTERVAL '34 minutes', NOW() - INTERVAL '33 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '24 minutes', NULL, NOW() - INTERVAL '35 minutes'),
      ('EC100250', 1, 1, 'E-Commerce',     'dispatched', 'Online Paid', 1500.00, 45, 'MEDIUM', NULL,  2,    3,    NOW() - INTERVAL '54 minutes', NOW() - INTERVAL '53 minutes', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '39 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '55 minutes'),
      ('WA100251', 1, 2, 'Self Pickup',    'new',        'COD',          320.00, 60, 'LOW',    NULL,  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '5 minutes'),
      ('CC100252', 1, 3, 'Call Center',    'new',        'COD',          580.00, 30, 'MEDIUM', NULL,  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 minute'),
      ('QC100253', 1, 6, 'Quick Commerce', 'picking',    'Online Paid',  430.00, 15, 'HIGH',   NULL,  4,    NULL, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '9 minutes',  NULL, NULL, NULL, NOW() - INTERVAL '12 minutes'),
      ('EC100254', 1, 7, 'E-Commerce',     'ready',      'Online Paid', 1120.00, 45, 'MEDIUM', 'P02', 2,    3,    NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '49 minutes', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '34 minutes', NULL, NOW() - INTERVAL '55 minutes'),
      ('WA100255', 2, 8, 'WhatsApp',       'new',        'COD',          275.00, 20, 'MEDIUM', NULL,  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '3 minutes'),
      ('CC100256', 2, 1, 'Call Center',    'dispatched', 'Online Paid',  950.00, 30, 'HIGH',   NULL,  6,    NULL, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '44 minutes', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '29 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '48 minutes');
    `);

    // 6. Order Items
    console.log('📦 Seeding order items...');
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, picked_qty, is_picked, is_verified) VALUES
      -- Order 1: QC100245 (new)
      (1, 1, 2, 0, false, false), (1, 3, 1, 0, false, false), (1, 5, 1, 0, false, false), (1, 13, 3, 0, false, false), (1, 14, 2, 0, false, false),
      -- Order 2: EC100246 (new)
      (2, 6, 1, 0, false, false), (2, 8, 1, 0, false, false), (2, 9, 1, 0, false, false),
      -- Order 3: WA100247 (picking)
      (3, 10, 1, 1, true,  false), (3, 11, 1, 0, false, false), (3, 12, 1, 0, false, false), (3, 15, 2, 2, true, false),
      -- Order 4: CC100248 (packing)
      (4, 13, 2, 2, true, true), (4, 14, 3, 3, true, true), (4, 15, 1, 1, true, true),
      -- Order 5: QC100249 (ready)
      (5, 1,  1, 1, true, true), (5, 16, 1, 1, true, true), (5, 17, 2, 2, true, true),
      -- Order 6: EC100250 (dispatched)
      (6, 10, 2, 2, true, true), (6, 11, 2, 2, true, true), (6, 12, 1, 1, true, true),
      -- Order 7: WA100251 (new - self pickup)
      (7, 3,  1, 0, false, false), (7, 18, 3, 0, false, false),
      -- Order 8: CC100252 (new)
      (8, 6,  1, 0, false, false), (8, 13, 1, 0, false, false), (8, 8, 1, 0, false, false),
      -- Order 9: QC100253 (picking)
      (9, 19, 2, 2, true, false), (9, 20, 1, 0, false, false), (9, 22, 1, 0, false, false),
      -- Order 10: EC100254 (ready)
      (10, 10, 1, 1, true, true), (10, 24, 1, 1, true, true), (10, 25, 2, 2, true, true), (10, 6, 1, 1, true, true),
      -- Order 11: WA100255 (new)
      (11, 1, 2, 0, false, false), (11, 15, 1, 0, false, false),
      -- Order 12: CC100256 (dispatched)
      (12, 10, 1, 1, true, true), (12, 21, 2, 2, true, true), (12, 23, 1, 1, true, true);
    `);

    // 7. Packing Trays
    console.log('🗂️  Seeding packing trays...');
    await client.query(`
      INSERT INTO packing_trays (tray_number, store_id, is_active, current_order_id) VALUES
      ('P01', 1, false, NULL), ('P02', 1, true,  10),  ('P03', 1, true,  4),
      ('P04', 1, false, NULL), ('P05', 1, false, NULL), ('P06', 1, false, NULL),
      ('P07', 1, true,  5),   ('P08', 1, false, NULL), ('P09', 1, false, NULL), ('P10', 1, false, NULL),
      ('S2-P01', 2, false, NULL), ('S2-P02', 2, false, NULL), ('S2-P03', 2, false, NULL);
    `);

    // 8. Returns
    console.log('↩️  Seeding returns...');
    await client.query(`
      INSERT INTO returns (order_id, reason, status, refund_amount) VALUES
      (6, 'Item damaged during delivery', 'approved', 140.00),
      (12, 'Wrong item delivered',         'pending',  950.00);
    `);

    // 9. SLA Logs
    console.log('📊 Seeding SLA logs...');
    await client.query(`
      INSERT INTO sla_logs (order_id, event, expected_time, actual_time, breach) VALUES
      (3, 'picking_started',    NOW() - INTERVAL '12 minutes', NOW() - INTERVAL '13 minutes', false),
      (4, 'picking_completed',  NOW() - INTERVAL '12 minutes', NOW() - INTERVAL '15 minutes', false),
      (4, 'packing_started',    NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '14 minutes', false),
      (5, 'packing_completed',  NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '24 minutes', false),
      (6, 'dispatched',         NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '25 minutes', true),
      (12,'dispatched',         NOW() - INTERVAL '18 minutes', NOW() - INTERVAL '15 minutes', false);
    `);

    console.log('\n🎉 All done! Supabase database seeded successfully.');
    console.log('   Tables: stores, customers, products, staff, orders, order_items, packing_trays, returns, sla_logs');

  } catch (err: any) {
    console.error('\n❌ Seed failed:', err.message);
    if (err.detail) console.error('   Detail:', err.detail);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
