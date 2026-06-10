import { Request, Response } from 'express';
import pool from '../db/pool';
import { io } from '../index';

// GET /api/returns
export const getReturns = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*, o.order_number, c.name AS customer_name, c.phone AS customer_phone
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('[getReturns]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /api/returns   body: { order_id, reason, refund_amount }
export const createReturn = async (req: Request, res: Response) => {
  try {
    const { order_id, reason, refund_amount } = req.body;

    const { rows } = await pool.query(`
      INSERT INTO returns (order_id, reason, refund_amount, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `, [order_id, reason, refund_amount]);

    io.emit('return:new', rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[createReturn]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// PUT /api/returns/:id/approve
export const approveReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      UPDATE returns SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *
    `, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Return not found' });
    io.emit('return:approved', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('[approveReturn]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
