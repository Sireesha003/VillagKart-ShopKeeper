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
        accepted_at TIMESTAMPTZ,
        picking_started_at TIMESTAMPTZ,
        picking_completed_at TIMESTAMPTZ,
        packing_started_at TIMESTAMPTZ,
        packing_completed_at TIMESTAMPTZ,
        dispatched_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
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
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sla_logs (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        event VARCHAR(100),
        expected_time TIMESTAMPTZ,
        actual_time TIMESTAMPTZ,
        breach BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Schema ready');

    console.log('🔄 Altering timestamp columns to TIMESTAMPTZ...');
    await client.query(`
      ALTER TABLE orders 
        ALTER COLUMN accepted_at TYPE TIMESTAMPTZ USING accepted_at AT TIME ZONE 'UTC',
        ALTER COLUMN picking_started_at TYPE TIMESTAMPTZ USING picking_started_at AT TIME ZONE 'UTC',
        ALTER COLUMN picking_completed_at TYPE TIMESTAMPTZ USING picking_completed_at AT TIME ZONE 'UTC',
        ALTER COLUMN packing_started_at TYPE TIMESTAMPTZ USING packing_started_at AT TIME ZONE 'UTC',
        ALTER COLUMN packing_completed_at TYPE TIMESTAMPTZ USING packing_completed_at AT TIME ZONE 'UTC',
        ALTER COLUMN dispatched_at TYPE TIMESTAMPTZ USING dispatched_at AT TIME ZONE 'UTC',
        ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
        ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
        
      ALTER TABLE sla_logs
        ALTER COLUMN expected_time TYPE TIMESTAMPTZ USING expected_time AT TIME ZONE 'UTC',
        ALTER COLUMN actual_time TYPE TIMESTAMPTZ USING actual_time AT TIME ZONE 'UTC',
        ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
        
      ALTER TABLE returns
        ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
    `);

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
      INSERT INTO products (name, sku, barcode, price, category, aisle_location, stock_qty, image_url) VALUES
      ('Amul Milk 500ml',       'MILK001', '8901063024427', 28.00,  'Dairy',      'A1', 50, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Amul%20Milk.jfif'),
      ('Amul Butter 100g',      'BTR001',  '8901063025423', 55.00,  'Dairy',      'A1', 35, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Amul%20Milk.jfif'),
      ('Bread Loaf',            'BRD001',  '8906001234567', 42.00,  'Bakery',     'B2', 30, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Britania%20Brown%20Bread.jfif'),
      ('Brown Bread',           'BRD002',  '8906001234568', 55.00,  'Bakery',     'B2', 20, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Britania%20Brown%20Bread.jfif'),
      ('Eggs 12pcs',            'EGG001',  '8901234567890', 75.00,  'Dairy',      'A2', 20, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Eggs.jfif'),
      ('Surf Excel 1kg',        'DET001',  '8901030829023', 120.00, 'Household',  'C1', 25, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Surf%20Excel.jfif'),
      ('Vim Dishwash 500g',     'DSH001',  '8901030812010', 65.00,  'Household',  'C2', 18, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Surf%20Excel.jfif'),
      ('Head & Shoulders 200ml','SHP001',  '8001090145215', 180.00, 'Personal',   'D1', 15, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Head%20%26%20Shoulder.jfif'),
      ('Nivea Face Wash 100ml', 'FCW001',  '4005900355683', 150.00, 'Personal',   'D2', 18, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Nivea.jfif'),
      ('Basmati Rice 5kg',      'RCE001',  '8904267001234', 350.00, 'Staples',    'E1', 12, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Basmathi%20Rice.jfif'),
      ('Toor Dal 1kg',          'DAL001',  '8904267005678', 120.00, 'Staples',    'E2', 20, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Split_Red_Lentil.jpg'),
      ('Sunflower Oil 1L',      'OIL001',  '8901289034012', 140.00, 'Cooking',    'E3', 10, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Sunflower%20Oil.jpg'),
      ('Lays Chips 52g',        'CHP001',  '8901491106940', 20.00,  'Snacks',     'F1', 40, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Lays.jpg'),
      ('Frooti 200ml',          'JCE001',  '8901063001190', 18.00,  'Beverages',  'G1', 35, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Mango.jpg'),
      ('Parle-G Biscuits 200g', 'BSC001',  '8901719110153', 10.00,  'Snacks',     'F2', 60, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Buscuits.jpg'),
      ('Colgate Total 200g',    'TPT001',  '8901314002444', 90.00,  'Personal',   'D3', 22, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Colgate.jpg'),
      ('Dettol Soap 75g',       'SOP001',  '8901396012832', 40.00,  'Personal',   'D4', 30, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Detol.jpg'),
      ('Maggi 70g',             'MGI001',  '8901058856787', 14.00,  'Instant',    'F3', 45, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Maggi%20Masala%20Noodles%20140g,%20HD%20Png%20Download%20,%20Transparent%20Png%20Image%20-%20PNGitem.jfif'),
      ('Pepsi 750ml',           'PPS001',  '8901234500001', 40.00,  'Beverages',  'G2', 25, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Coco%20Cola.jfif'),
      ('Coca Cola 750ml',       'CCL001',  '8901234500002', 40.00,  'Beverages',  'G2', 25, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Coco%20Cola.jfif'),
      ('Haldiram Bhujia 200g',  'HLD001',  '8906003100001', 80.00,  'Snacks',     'F4', 15, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Lays.jpg'),
      ('Nestle KitKat 4F',      'KTK001',  '8901234600001', 30.00,  'Snacks',     'F5', 50, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Buscuits.jpg'),
      ('Tropicana OJ 1L',       'TRO001',  '8901234700001', 120.00, 'Beverages',  'G3', 12, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Mango.jpg'),
      ('Saffola Gold Oil 1L',   'SFG001',  '8901289010001', 160.00, 'Cooking',    'E4', 8,  'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Fortune%20oil.jfif'),
      ('Atta 5kg Aashirvaad',   'ATT001',  '8901600000001', 250.00, 'Staples',    'E5', 15, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Ashirivaad.jfif');
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
      INSERT INTO orders (order_number, store_id, customer_id, order_type, status, payment_method, total_value, sla_minutes, priority, created_at, updated_at) VALUES
      ('QC100245', 1, 1, 'Quick Commerce', 'new', 'Online Paid', 1240.00, 15, 'HIGH',   NOW()-INTERVAL '2 min',  NOW()-INTERVAL '2 min'),
      ('EC100246', 1, 2, 'E-Commerce',     'new', 'COD',          890.00, 45, 'MEDIUM', NOW()-INTERVAL '8 min',  NOW()-INTERVAL '8 min'),
      ('WA100247', 1, 3, 'WhatsApp',       'new', 'Online Paid', 1080.00, 20, 'HIGH',   NOW()-INTERVAL '15 min', NOW()-INTERVAL '14 min'),
      ('CC100248', 1, 4, 'Call Center',    'new', 'COD',          420.00, 30, 'LOW',    NOW()-INTERVAL '22 min', NOW()-INTERVAL '18 min'),
      ('QC100249', 1, 5, 'Quick Commerce', 'new', 'Online Paid',  760.00, 15, 'HIGH',   NOW()-INTERVAL '35 min', NOW()-INTERVAL '10 min'),
      ('EC100250', 1, 1, 'E-Commerce',     'new', 'Online Paid', 1500.00, 45, 'MEDIUM', NOW()-INTERVAL '55 min', NOW()-INTERVAL '5 min'),
      ('WA100251', 1, 2, 'Self Pickup',    'new', 'COD',          320.00, 60, 'LOW',    NOW()-INTERVAL '5 min',  NOW()-INTERVAL '5 min'),
      ('CC100252', 1, 3, 'Call Center',    'new', 'COD',          580.00, 30, 'MEDIUM', NOW()-INTERVAL '1 min',  NOW()-INTERVAL '1 min'),
      ('QC100253', 1, 6, 'Quick Commerce', 'new', 'Online Paid',  950.00, 15, 'HIGH',   NOW()-INTERVAL '10 min', NOW()-INTERVAL '9 min'),
      ('EC100254', 1, 7, 'E-Commerce',     'new', 'Online Paid', 1320.00, 45, 'MEDIUM', NOW()-INTERVAL '20 min', NOW()-INTERVAL '18 min'),
      ('WA100255', 1, 8, 'WhatsApp',       'new', 'COD',          640.00, 30, 'LOW',    NOW()-INTERVAL '40 min', NOW()-INTERVAL '25 min'),
      ('QC100256', 1, 1, 'Quick Commerce', 'new', 'Online Paid',  880.00, 15, 'HIGH',   NOW()-INTERVAL '70 min', NOW()-INTERVAL '50 min');
    `);

    // 6. Order Items
    console.log('📦 Seeding order items...');
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, picked_qty, is_picked, is_verified) VALUES
      (1, 1, 2, 0, false, false), (1, 3, 1, 0, false, false), (1, 5, 1, 0, false, false), (1, 13, 3, 0, false, false), (1, 14, 2, 0, false, false),
      (2, 6, 1, 0, false, false), (2, 8, 1, 0, false, false), (2, 9, 1, 0, false, false),
      (3,7,1,0,false),(3,8,1,0,false),(3,9,1,0,false),(3,12,2,0,false),
      (4,10,2,0,false),(4,11,3,0,false),(4,12,1,0,false),
      (5,1,1,0,false),(5,13,1,0,false),(5,14,2,0,false),
      (6,7,2,0,false),(6,8,2,0,false),(6,9,1,0,false),
      (7,2,1,0,false),(7,15,3,0,false),
      (8,4,1,0,false),(8,10,1,0,false),(8,5,1,0,false),
      (9,17,1,0,false),(9,18,1,0,false),(9,19,2,0,false),(9,20,2,0,false),
      (10,1,2,0,false),(10,16,1,0,false),(10,3,2,0,false),
      (11,13,1,0,false),(11,14,2,0,false),(11,6,1,0,false),
      (12,15,3,0,false),(12,10,2,0,false);
    `);

    // 7. Packing Trays
    console.log('🗂️  Seeding packing trays...');
    await client.query(`
      INSERT INTO packing_trays (tray_number, store_id, is_active, current_order_id) VALUES
      ('P01', 1, false, NULL), ('P02', 1, false, NULL), ('P03', 1, false, NULL),
      ('P04', 1, false, NULL), ('P05', 1, false, NULL), ('P06', 1, false, NULL),
      ('P07', 1, false, NULL), ('P08', 1, false, NULL), ('P09', 1, false, NULL), ('P10', 1, false, NULL),
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
      (3, 'acceptance', NOW()+INTERVAL '13 min',  NULL, false),
      (3, 'picking',    NOW()+INTERVAL '15 min',  NULL, false),
      (4, 'packing',    NOW()+INTERVAL '18 min',  NULL, false);
    `);

    // ─── 10. Update Total Values ──────────────────────────────────────────
    await client.query(`
      UPDATE orders o
      SET total_value = (
        SELECT COALESCE(SUM(p.price * oi.quantity), 0)
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = o.id
      )
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
