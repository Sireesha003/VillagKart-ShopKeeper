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

    // Hourly order volume (last 6 hours in 30-min slots)
    const { rows: hourlyRaw } = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('hour', created_at) + 
          INTERVAL '30 min' * FLOOR(EXTRACT(MINUTE FROM created_at)/30), 'HH24:MI') AS time,
        COUNT(*)::int AS orders,
        COUNT(*) FILTER (
          WHERE EXTRACT(EPOCH FROM (COALESCE(dispatched_at, NOW()) - created_at))/60 <= sla_minutes
        )::int AS "onTime",
        COUNT(*) FILTER (
          WHERE EXTRACT(EPOCH FROM (COALESCE(dispatched_at, NOW()) - created_at))/60 > sla_minutes
        )::int AS breached
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '6 hours'
      GROUP BY 1
      ORDER BY 1
    `);

    // Stage processing times per 30-min slot
    const { rows: stageRaw } = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('hour', created_at) + 
          INTERVAL '30 min' * FLOOR(EXTRACT(MINUTE FROM created_at)/30), 'HH24:MI') AS time,
        COALESCE(ROUND(AVG(CASE WHEN picking_started_at IS NOT NULL AND picking_completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (picking_completed_at - picking_started_at))/60 END)::numeric, 1), 0) AS picking,
        COALESCE(ROUND(AVG(CASE WHEN packing_started_at IS NOT NULL AND packing_completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (packing_completed_at - packing_started_at))/60 END)::numeric, 1), 0) AS packing,
        COALESCE(ROUND(AVG(CASE WHEN packing_completed_at IS NOT NULL AND dispatched_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (dispatched_at - packing_completed_at))/60 END)::numeric, 1), 0) AS handover
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '6 hours'
      GROUP BY 1
      ORDER BY 1
    `);

    res.json({ breaches, summary: summary[0], hourlyData: hourlyRaw, processingTimes: stageRaw });
  } catch (err) {
    console.error('[getSLAReport]', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
