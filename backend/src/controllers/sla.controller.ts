import { Request, Response } from 'express';
import pool from '../db/pool';

// GET /api/sla
export const getSLAReport = async (req: Request, res: Response) => {
  try {
    const { rows: breaches } = await pool.query(`
      SELECT o.order_number, o.order_type, o.priority, o.status,
             o.sla_minutes,
             ROUND(EXTRACT(EPOCH FROM (NOW() - o.created_at))/60)::int AS elapsed_minutes,
             ROUND(EXTRACT(EPOCH FROM (NOW() - o.created_at))/60 - o.sla_minutes)::int AS delay_minutes,
             c.name AS customer_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.status NOT IN ('dispatched','cancelled')
        AND EXTRACT(EPOCH FROM (NOW() - o.created_at))/60 > o.sla_minutes
      ORDER BY delay_minutes DESC
    `);

    const { rows: summary } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('dispatched','cancelled')
          AND EXTRACT(EPOCH FROM (NOW()-created_at))/60 > sla_minutes)::int AS active_breaches,
        COUNT(*) FILTER (WHERE status NOT IN ('dispatched','cancelled')
          AND EXTRACT(EPOCH FROM (NOW()-created_at))/60 BETWEEN sla_minutes*0.8 AND sla_minutes)::int AS at_risk,
        COUNT(*) FILTER (WHERE status NOT IN ('dispatched','cancelled'))::int AS active_orders,
        ROUND(AVG(CASE WHEN dispatched_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (dispatched_at - created_at))/60 END)::numeric,1) AS avg_fulfillment
      FROM orders
      WHERE created_at >= CURRENT_DATE
    `);

    res.json({ breaches, summary: summary[0] });
  } catch (err) {
    console.error('[getSLAReport]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
