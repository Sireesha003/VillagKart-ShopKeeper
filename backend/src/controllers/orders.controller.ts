import { Request, Response } from 'express';
import pool from '../db/pool';
import { io } from '../index';

// GET /api/orders  (optional ?status=new|accepted|picking|packing|ready|dispatched|cancelled)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, store_id } = req.query;
    const params: any[] = [];
    let where = 'WHERE 1=1';

    if (status) {
      params.push(status);
      where += ` AND o.status = $${params.length}`;
    }
    if (store_id) {
      params.push(store_id);
      where += ` AND o.store_id = $${params.length}`;
    }

    const { rows } = await pool.query(`
      SELECT
        o.*,
        c.name   AS customer_name,
        c.phone  AS customer_phone,
        c.address AS customer_address,
        COUNT(oi.id)::int                       AS item_count,
        SUM(CASE WHEN oi.is_picked THEN 1 ELSE 0 END)::int AS picked_count,
        EXTRACT(EPOCH FROM (NOW() - o.created_at))/60::int AS elapsed_minutes
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${where}
      GROUP BY o.id, c.name, c.phone, c.address
      ORDER BY
        CASE o.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
        o.created_at ASC
    `, params);

    res.json(rows);
  } catch (err) {
    console.error('[getOrders]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /api/orders/:id  (includes full item list)
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { rows: orderRows } = await pool.query(`
      SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.address AS customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [id]);

    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });

    const order = orderRows[0];

    const { rows: itemRows } = await pool.query(`
      SELECT oi.id, oi.quantity, oi.picked_qty, oi.is_picked, oi.is_verified,
             p.id AS product_id, p.name, p.sku, p.barcode, p.price,
             p.category, p.aisle_location, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY p.aisle_location
    `, [id]);

    order.items = itemRows;
    res.json(order);
  } catch (err) {
    console.error('[getOrderById]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// PUT /api/orders/:id/accept
export const acceptOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(`
      UPDATE orders
      SET status = 'accepted', accepted_at = TIMEZONE('Asia/Kolkata', NOW()), updated_at = TIMEZONE('Asia/Kolkata', NOW())
      WHERE id = $1 AND status = 'new'
      RETURNING *
    `, [id]);

    if (!rows.length) return res.status(404).json({ error: 'Order not found or already processed' });

    io.emit('order:status', { orderId: id, status: 'accepted' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[acceptOrder]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// PUT /api/orders/:id/reject
export const rejectOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(`
      UPDATE orders
      SET status = 'cancelled', updated_at = TIMEZONE('Asia/Kolkata', NOW())
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (!rows.length) return res.status(404).json({ error: 'Order not found' });

    io.emit('order:status', { orderId: id, status: 'cancelled' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[rejectOrder]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// PUT /api/orders/:id/status   body: { status }
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tray_number } = req.body;

    const tsField: Record<string, string> = {
      picking:    ", picking_started_at = TIMEZONE('Asia/Kolkata', NOW())",
      packing:    ", packing_started_at = TIMEZONE('Asia/Kolkata', NOW())",
      ready:      ", packing_completed_at = TIMEZONE('Asia/Kolkata', NOW())",
      dispatched: ", dispatched_at = TIMEZONE('Asia/Kolkata', NOW())",
    };
    const extra = tsField[status] || '';

    const { rows } = await pool.query(`
      UPDATE orders
      SET status = $1, updated_at = TIMEZONE('Asia/Kolkata', NOW())${extra}
          ${tray_number ? ', tray_number = $3' : ''}
      WHERE id = $2
      RETURNING *
    `, tray_number ? [status, id, tray_number] : [status, id]);

    if (!rows.length) return res.status(404).json({ error: 'Order not found' });

    io.emit('order:status', { orderId: id, status });
    res.json(rows[0]);
  } catch (err) {
    console.error('[updateOrderStatus]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// PUT /api/orders/:orderId/items/:itemId/pick
export const pickItem = async (req: Request, res: Response) => {
  try {
    const { orderId, itemId } = req.params;

    const { rows } = await pool.query(`
      UPDATE order_items
      SET is_picked = true, picked_qty = quantity
      WHERE id = $1 AND order_id = $2
      RETURNING *
    `, [itemId, orderId]);

    if (!rows.length) return res.status(404).json({ error: 'Item not found' });

    // Check if all items are picked → auto-advance to packing
    const { rows: remaining } = await pool.query(`
      SELECT COUNT(*) AS cnt FROM order_items WHERE order_id = $1 AND is_picked = false
    `, [orderId]);

    if (Number(remaining[0].cnt) === 0) {
      await pool.query(`
        UPDATE orders SET status = 'packing', picking_completed_at = TIMEZONE('Asia/Kolkata', NOW()), updated_at = TIMEZONE('Asia/Kolkata', NOW()) WHERE id = $1
      `, [orderId]);
      io.emit('order:status', { orderId, status: 'packing' });
    } else {
      io.emit('order:item_picked', { orderId, itemId });
    }

    res.json({ success: true, item: rows[0] });
  } catch (err) {
    console.error('[pickItem]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
