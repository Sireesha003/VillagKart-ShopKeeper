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
      INSERT INTO products (name, sku, barcode, price, category, aisle_location, stock_qty, image_url) VALUES
      ('Amul Milk 500ml',        'MILK001', '8901063024427', 28.00,  'Dairy',     'R01-S02-T05', 50, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Amul%20Milk.jfif'),
      ('Britannia Bread',        'BRD001',  '8906001234567', 42.00,  'Bakery',    'R01-S03-T01', 30, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Britania%20Brown%20Bread.jfif'),
      ('Farm Fresh Eggs 12pc',   'EGG001',  '8901234567890', 75.00,  'Dairy',     'R01-S02-T06', 20, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Eggs.jfif'),
      ('Surf Excel 1kg',         'DET001',  '8901030829023',120.00,  'Household', 'R03-S01-T02', 25, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Surf%20Excel.jfif'),
      ('Head & Shoulders 200ml', 'SHP001',  '8001090145215',180.00,  'Personal',  'R03-S02-T01', 15, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Head%20%26%20Shoulder.jfif'),
      ('Nivea Face Wash 100g',   'FCW001',  '4005900355683',150.00,  'Personal',  'R03-S02-T03', 18, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Nivea.jfif'),
      ('Basmati Rice 5kg',       'RCE001',  '8904267001234',350.00,  'Staples',   'R02-S01-T01', 12, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Basmathi%20Rice.jfif'),
      ('Toor Dal 1kg',           'DAL001',  '8904267005678',120.00,  'Staples',   'R02-S01-T02', 20, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Tool%20dal.jfif'),
      ('Sunflower Oil 1L',       'OIL001',  '8901289034012',140.00,  'Cooking',   'R02-S02-T02', 10, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Freedom%20oil.jfif'),
      ('Lays Chips 52g',         'CHP001',  '8901491106940', 20.00,  'Snacks',    'R04-S01-T01', 40, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Lays%20chips.jfif'),
      ('Frooti Mango 200ml',     'JCE001',  '8901063001190', 18.00,  'Beverages', 'R04-S02-T01', 35, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/frooti.jfif'),
      ('Parle-G Biscuits 200g',  'BSC001',  '8901719110153', 30.00,  'Snacks',    'R04-S01-T02', 60, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/parle%20buscuits.jfif'),
      ('Colgate Toothpaste 200g','TPT001',  '8901314002444', 90.00,  'Personal',  'R03-S02-T04', 22, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/colgate.jfif'),
      ('Dettol Soap 75g',        'SOP001',  '8901396012832', 40.00,  'Personal',  'R03-S01-T03', 30, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Detol.jfif'),
      ('Maggi Noodles 70g',      'MGI001',  '8901058856787', 14.00,  'Instant',   'R04-S01-T03', 45, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Maggi%20Masala%20Noodles%20140g,%20HD%20Png%20Download%20,%20Transparent%20Png%20Image%20-%20PNGitem.jfif'),
      ('Tata Salt 1kg',          'SAL001',  '8901234500012', 24.00,  'Staples',   'R02-S01-T03', 55, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Tata%20Salt,%20Tata%20Salt%20Png%20_.jfif'),
      ('Fortune Refined Oil 1L', 'OIL002',  '8901289034099',165.00,  'Cooking',   'R02-S02-T03', 18, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Fortune%20oil.jfif'),
      ('Aashirvaad Atta 5kg',    'ATT001',  '8901010165524',280.00,  'Staples',   'R02-S01-T04', 14, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Ashirivaad.jfif'),
      ('Haldirams Bhujia 200g',  'BHJ001',  '8904109400017',120.00,  'Snacks',    'R04-S01-T04', 22, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Haldhirams.jfif'),
      ('Coca-Cola 2L',           'COL001',  '5449000154460', 95.00,  'Beverages', 'R04-S02-T02', 28, 'https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/Coco%20Cola.jfif')
    `);

    // ─── 5. Orders ────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO orders (order_number, store_id, customer_id, order_type, status, payment_method, total_value, sla_minutes, priority, tray_number, created_at, updated_at) VALUES
      ('QC100245', 1, 1, 'Quick Commerce', 'new', 'Online Paid', 1240.00, 15, 'HIGH',   NULL, NOW()-INTERVAL '2 min',  NOW()-INTERVAL '2 min'),
      ('EC100246', 1, 2, 'E-Commerce',     'new', 'COD',          890.00, 45, 'MEDIUM', NULL, NOW()-INTERVAL '8 min',  NOW()-INTERVAL '8 min'),
      ('WA100247', 1, 3, 'WhatsApp',       'new', 'Online Paid', 1080.00, 20, 'HIGH',   NULL, NOW()-INTERVAL '15 min', NOW()-INTERVAL '14 min'),
      ('CC100248', 1, 4, 'Call Center',    'new', 'COD',          420.00, 30, 'LOW',    NULL, NOW()-INTERVAL '22 min', NOW()-INTERVAL '18 min'),
      ('QC100249', 1, 5, 'Quick Commerce', 'new', 'Online Paid',  760.00, 15, 'HIGH',   NULL, NOW()-INTERVAL '35 min', NOW()-INTERVAL '10 min'),
      ('EC100250', 1, 1, 'E-Commerce',     'new', 'Online Paid', 1500.00, 45, 'MEDIUM', NULL, NOW()-INTERVAL '55 min', NOW()-INTERVAL '5 min'),
      ('WA100251', 1, 2, 'Self Pickup',    'new', 'COD',          320.00, 60, 'LOW',    NULL, NOW()-INTERVAL '5 min',  NOW()-INTERVAL '5 min'),
      ('CC100252', 1, 3, 'Call Center',    'new', 'COD',          580.00, 30, 'MEDIUM', NULL, NOW()-INTERVAL '1 min',  NOW()-INTERVAL '1 min'),
      ('QC100253', 1, 6, 'Quick Commerce', 'new', 'Online Paid',  950.00, 15, 'HIGH',   NULL, NOW()-INTERVAL '10 min', NOW()-INTERVAL '9 min'),
      ('EC100254', 1, 7, 'E-Commerce',     'new', 'Online Paid', 1320.00, 45, 'MEDIUM', NULL, NOW()-INTERVAL '20 min', NOW()-INTERVAL '18 min'),
      ('WA100255', 1, 8, 'WhatsApp',       'new', 'COD',          640.00, 30, 'LOW',    NULL, NOW()-INTERVAL '40 min', NOW()-INTERVAL '25 min'),
      ('QC100256', 1, 1, 'Quick Commerce', 'new', 'Online Paid',  880.00, 15, 'HIGH',   NULL, NOW()-INTERVAL '70 min', NOW()-INTERVAL '50 min')
    `);

    // ─── 6. Order Items ───────────────────────────────────────────────────
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, picked_qty, is_picked) VALUES
      -- QC100245 (new)
      (1,1,2,0,false),(1,2,1,0,false),(1,3,1,0,false),(1,10,3,0,false),(1,11,2,0,false),
      -- EC100246 (new)
      (2,4,1,0,false),(2,5,1,0,false),(2,6,1,0,false),(2,16,2,0,false),
      -- WA100247
      (3,7,1,0,false),(3,8,1,0,false),(3,9,1,0,false),(3,12,2,0,false),
      -- CC100248
      (4,10,2,0,false),(4,11,3,0,false),(4,12,1,0,false),
      -- QC100249
      (5,1,1,0,false),(5,13,1,0,false),(5,14,2,0,false),
      -- EC100250
      (6,7,2,0,false),(6,8,2,0,false),(6,9,1,0,false),
      -- WA100251
      (7,2,1,0,false),(7,15,3,0,false),
      -- CC100252
      (8,4,1,0,false),(8,10,1,0,false),(8,5,1,0,false),
      -- QC100253
      (9,17,1,0,false),(9,18,1,0,false),(9,19,2,0,false),(9,20,2,0,false),
      -- EC100254
      (10,1,2,0,false),(10,16,1,0,false),(10,3,2,0,false),
      -- WA100255
      (11,13,1,0,false),(11,14,2,0,false),(11,6,1,0,false),
      -- QC100256
      (12,15,3,0,false),(12,10,2,0,false)
    `);

    // ─── 7. Packing Trays ─────────────────────────────────────────────────
    await client.query(`
      INSERT INTO packing_trays (tray_number, store_id, is_active, current_order_id) VALUES
      ('P01', 1, false, NULL), ('P02', 1, false, NULL), ('P03', 1, false, NULL),
      ('P04', 1, false, NULL), ('P05', 1, false, NULL), ('P06', 1, false, NULL),
      ('P07', 1, false, NULL), ('P08', 1, false, NULL), ('P09', 1, false, NULL), ('P10', 1, false, NULL)
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
      (3, 'picking',    NOW()+INTERVAL '15 min',  NULL,           false),
      (4, 'packing',    NOW()+INTERVAL '18 min',  NULL,           false)
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
