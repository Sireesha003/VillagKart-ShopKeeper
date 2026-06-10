import { Request, Response } from 'express';
import pool from '../db/pool';

// GET /api/dashboard/stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'new')::int                  AS new_orders,
        COUNT(*) FILTER (WHERE status = 'accepted')::int             AS accepted_orders,
        COUNT(*) FILTER (WHERE status = 'picking')::int              AS picking_orders,
        COUNT(*) FILTER (WHERE status = 'packing')::int              AS packing_orders,
        COUNT(*) FILTER (WHERE status = 'ready')::int                AS ready_orders,
        COUNT(*) FILTER (WHERE status = 'dispatched')::int           AS dispatched_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int            AS cancelled_orders,
        COUNT(*)::int                                                 AS total_orders,
        ROUND(AVG(
          CASE WHEN dispatched_at IS NOT NULL AND accepted_at IS NOT NULL
               THEN EXTRACT(EPOCH FROM (dispatched_at - accepted_at))/60
          END
        )::numeric, 1)                                               AS avg_fulfillment_mins,
        COUNT(*) FILTER (WHERE sla_breach = true)::int               AS sla_breaches,
        COALESCE(SUM(total_value) FILTER (WHERE status = 'dispatched'), 0) AS revenue_today
      FROM orders
      WHERE created_at >= CURRENT_DATE
    `);

    // Per-hour breakdown for last 6 hours
    const { rows: hourlyRows } = await pool.query(`
      SELECT
        DATE_TRUNC('hour', created_at) AS hour,
        COUNT(*)::int AS orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '6 hours'
      GROUP BY 1
      ORDER BY 1
    `);

    res.json({ ...rows[0], hourly: hourlyRows });
  } catch (err) {
    console.error('[getStats]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
