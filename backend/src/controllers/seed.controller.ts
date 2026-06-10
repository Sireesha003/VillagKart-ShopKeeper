import { Request, Response } from 'express';
import pool from '../db/pool';

// POST /api/seed  — drops existing data and re-inserts reference data
export const seedDatabase = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ─── Clear in dependency order ───────────────────────────────────────
    await client.query('DELETE FROM sla_logs');
    await client.query('DELETE FROM returns');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM packing_trays');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM staff');
    await client.query('DELETE FROM customers');
    await client.query('DELETE FROM stores');

    // Reset sequences
    for (const seq of ['stores','customers','products','orders','order_items','packing_trays','returns','sla_logs','staff']) {
      await client.query(`ALTER SEQUENCE ${seq}_id_seq RESTART WITH 1`);
    }

    // ─── 1. Store ─────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO stores (name, location, manager_name, operating_hours, rating, is_open)
      VALUES ('Hyderabad Store 01', 'Kondapur, Hyderabad', 'Rohit Singh', '6:00 AM - 11:00 PM', 4.8, true)
    `);

    // ─── 2. Staff ─────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO staff (store_id, name, role, initials, phone) VALUES
      (1, 'Rohit Singh',  'manager', 'RS', '+91 98765 00001'),
      (1, 'Arjun Kumar',  'picker',  'AK', '+91 98765 00002'),
      (1, 'Meena Devi',   'packer',  'MD', '+91 98765 00003'),
      (1, 'Suresh Babu',  'picker',  'SB', '+91 98765 00004'),
      (1, 'Lakshmi N',    'packer',  'LN', '+91 98765 00005')
    `);

    // ─── 3. Customers ─────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO customers (name, phone, address) VALUES
      ('Rahul Sharma',   '+91 98765 43210', 'Flat 4B, Green Park Apts, Kondapur, Hyderabad'),
      ('Priya Mehta',    '+91 87654 32109', 'House 12, Madhapur Main Road, Hyderabad'),
      ('Amir Khan',      '+91 76543 21098', '302 Cyber Towers, Hitech City, Hyderabad'),
      ('Sunita Devi',    '+91 65432 10987', 'Banjara Hills, Road No 12, Hyderabad'),
      ('Vikram Reddy',   '+91 54321 09876', 'Jubilee Hills, Plot 45, Hyderabad'),
      ('Ananya Krishnan','+91 91234 56789', 'Gachibowli, DLF Phase 1, Hyderabad'),
      ('Ravi Shankar',   '+91 80123 45678', 'KPHB Colony, Phase 5, Hyderabad'),
      ('Deepa Nair',     '+91 70987 65432', 'Miyapur, Chandanagar, Hyderabad')
    `);

    // ─── 4. Products ──────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO products (name, sku, barcode, price, category, aisle_location, stock_qty) VALUES
      ('Amul Milk 500ml',        'MILK001', '8901063024427', 28.00,  'Dairy',     'R01-S02-T05', 50),
      ('Britannia Bread',        'BRD001',  '8906001234567', 42.00,  'Bakery',    'R01-S03-T01', 30),
      ('Farm Fresh Eggs 12pc',   'EGG001',  '8901234567890', 75.00,  'Dairy',     'R01-S02-T06', 20),
      ('Surf Excel 1kg',         'DET001',  '8901030829023',120.00,  'Household', 'R03-S01-T02', 25),
      ('Head & Shoulders 200ml', 'SHP001',  '8001090145215',180.00,  'Personal',  'R03-S02-T01', 15),
      ('Nivea Face Wash 100g',   'FCW001',  '4005900355683',150.00,  'Personal',  'R03-S02-T03', 18),
      ('Basmati Rice 5kg',       'RCE001',  '8904267001234',350.00,  'Staples',   'R02-S01-T01', 12),
      ('Toor Dal 1kg',           'DAL001',  '8904267005678',120.00,  'Staples',   'R02-S01-T02', 20),
      ('Sunflower Oil 1L',       'OIL001',  '8901289034012',140.00,  'Cooking',   'R02-S02-T02', 10),
      ('Lays Chips 52g',         'CHP001',  '8901491106940', 20.00,  'Snacks',    'R04-S01-T01', 40),
      ('Frooti Mango 200ml',     'JCE001',  '8901063001190', 18.00,  'Beverages', 'R04-S02-T01', 35),
      ('Parle-G Biscuits 200g',  'BSC001',  '8901719110153', 30.00,  'Snacks',    'R04-S01-T02', 60),
      ('Colgate Toothpaste 200g','TPT001',  '8901314002444', 90.00,  'Personal',  'R03-S02-T04', 22),
      ('Dettol Soap 75g',        'SOP001',  '8901396012832', 40.00,  'Personal',  'R03-S01-T03', 30),
      ('Maggi Noodles 70g',      'MGI001',  '8901058856787', 14.00,  'Instant',   'R04-S01-T03', 45),
      ('Tata Salt 1kg',          'SAL001',  '8901234500012', 24.00,  'Staples',   'R02-S01-T03', 55),
      ('Fortune Refined Oil 1L', 'OIL002',  '8901289034099',165.00,  'Cooking',   'R02-S02-T03', 18),
      ('Aashirvaad Atta 5kg',    'ATT001',  '8901010165524',280.00,  'Staples',   'R02-S01-T04', 14),
      ('Haldirams Bhujia 200g',  'BHJ001',  '8904109400017',120.00,  'Snacks',    'R04-S01-T04', 22),
      ('Coca-Cola 2L',           'COL001',  '5449000154460', 95.00,  'Beverages', 'R04-S02-T02', 28)
    `);

    // ─── 5. Orders ────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO orders (order_number, store_id, customer_id, order_type, status, payment_method, total_value, sla_minutes, priority, tray_number, created_at, updated_at) VALUES
      ('QC100245', 1, 1, 'Quick Commerce', 'new',       'Online Paid', 1240.00, 15, 'HIGH',   NULL,  NOW()-INTERVAL '2 min',  NOW()-INTERVAL '2 min'),
      ('EC100246', 1, 2, 'E-Commerce',     'new',       'COD',          890.00, 45, 'MEDIUM', NULL,  NOW()-INTERVAL '8 min',  NOW()-INTERVAL '8 min'),
      ('WA100247', 1, 3, 'WhatsApp',       'picking',   'Online Paid', 1080.00, 20, 'HIGH',   NULL,  NOW()-INTERVAL '15 min', NOW()-INTERVAL '14 min'),
      ('CC100248', 1, 4, 'Call Center',    'packing',   'COD',          420.00, 30, 'LOW',    'P03', NOW()-INTERVAL '22 min', NOW()-INTERVAL '18 min'),
      ('QC100249', 1, 5, 'Quick Commerce', 'ready',     'Online Paid',  760.00, 15, 'HIGH',   'P07', NOW()-INTERVAL '35 min', NOW()-INTERVAL '10 min'),
      ('EC100250', 1, 1, 'E-Commerce',     'dispatched','Online Paid', 1500.00, 45, 'MEDIUM', NULL,  NOW()-INTERVAL '55 min', NOW()-INTERVAL '5 min'),
      ('WA100251', 1, 2, 'Self Pickup',    'new',       'COD',          320.00, 60, 'LOW',    NULL,  NOW()-INTERVAL '5 min',  NOW()-INTERVAL '5 min'),
      ('CC100252', 1, 3, 'Call Center',    'new',       'COD',          580.00, 30, 'MEDIUM', NULL,  NOW()-INTERVAL '1 min',  NOW()-INTERVAL '1 min'),
      ('QC100253', 1, 6, 'Quick Commerce', 'accepted',  'Online Paid',  950.00, 15, 'HIGH',   NULL,  NOW()-INTERVAL '10 min', NOW()-INTERVAL '9 min'),
      ('EC100254', 1, 7, 'E-Commerce',     'picking',   'Online Paid', 1320.00, 45, 'MEDIUM', NULL,  NOW()-INTERVAL '20 min', NOW()-INTERVAL '18 min'),
      ('WA100255', 1, 8, 'WhatsApp',       'packing',   'COD',          640.00, 30, 'LOW',    'P02', NOW()-INTERVAL '40 min', NOW()-INTERVAL '25 min'),
      ('QC100256', 1, 1, 'Quick Commerce', 'dispatched','Online Paid',  880.00, 15, 'HIGH',   NULL,  NOW()-INTERVAL '70 min', NOW()-INTERVAL '50 min')
    `);

    // ─── 6. Order Items ───────────────────────────────────────────────────
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, picked_qty, is_picked) VALUES
      -- QC100245 (new)
      (1,1,2,0,false),(1,2,1,0,false),(1,3,1,0,false),(1,10,3,0,false),(1,11,2,0,false),
      -- EC100246 (new)
      (2,4,1,0,false),(2,5,1,0,false),(2,6,1,0,false),(2,16,2,0,false),
      -- WA100247 (picking - 2 of 4 picked)
      (3,7,1,1,true),(3,8,1,0,false),(3,9,1,0,false),(3,12,2,0,false),
      -- CC100248 (packing - all picked)
      (4,10,2,2,true),(4,11,3,3,true),(4,12,1,1,true),
      -- QC100249 (ready - all picked)
      (5,1,1,1,true),(5,13,1,1,true),(5,14,2,2,true),
      -- EC100250 (dispatched)
      (6,7,2,2,true),(6,8,2,2,true),(6,9,1,1,true),
      -- WA100251 (self pickup/new)
      (7,2,1,0,false),(7,15,3,0,false),
      -- CC100252 (new)
      (8,4,1,0,false),(8,10,1,0,false),(8,5,1,0,false),
      -- QC100253 (accepted)
      (9,17,1,0,false),(9,18,1,0,false),(9,19,2,0,false),(9,20,2,0,false),
      -- EC100254 (picking - 1 of 3 picked)
      (10,1,2,2,true),(10,16,1,0,false),(10,3,2,0,false),
      -- WA100255 (packing - all picked)
      (11,13,1,1,true),(11,14,2,2,true),(11,6,1,1,true),
      -- QC100256 (dispatched)
      (12,15,3,3,true),(12,10,2,2,true)
    `);

    // ─── 7. Packing Trays ─────────────────────────────────────────────────
    await client.query(`
      INSERT INTO packing_trays (tray_number, store_id, is_active, current_order_id) VALUES
      ('P01', 1, false, NULL), ('P02', 1, true,  11),  ('P03', 1, true,  4),
      ('P04', 1, false, NULL), ('P05', 1, false, NULL), ('P06', 1, false, NULL),
      ('P07', 1, true,  5),   ('P08', 1, false, NULL), ('P09', 1, false, NULL), ('P10', 1, false, NULL)
    `);

    // ─── 8. Returns ───────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO returns (order_id, reason, status, refund_amount) VALUES
      (6, 'Wrong Item Delivered', 'approved', 95.00),
      (12,'Damaged Product',      'pending',  880.00)
    `);

    // ─── 9. SLA logs ──────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO sla_logs (order_id, event, expected_time, actual_time, breach) VALUES
      (1, 'acceptance', NOW()+INTERVAL '13 min',  NULL,           false),
      (3, 'picking',    NOW()-INTERVAL '5 min',   NULL,           true),
      (4, 'packing',    NOW()-INTERVAL '8 min',   NULL,           true)
    `);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Database seeded with 12 orders, 20 products, 8 customers!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seedDatabase]', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
};
