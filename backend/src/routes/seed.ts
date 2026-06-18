import { Router } from 'express';
import { seedDatabase } from '../controllers/seed.controller';

const router = Router();
router.get('/', seedDatabase);
router.post('/', seedDatabase);

router.get('/supabase', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query("SELECT name FROM storage.objects WHERE bucket_id = 'product-images'");
    await pool.end();
    res.json(result.rows.map((row: { name: string }) => row.name));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
