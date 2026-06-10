import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use DIRECT_URL for schema/migration work (bypasses pgbouncer)
// Use DATABASE_URL (pgbouncer) for all runtime queries
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase hosted PostgreSQL
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.query('SELECT 1').then(() => {
  console.log('✅ Supabase PostgreSQL connected successfully.');
}).catch((err) => {
  console.error('❌ Supabase PostgreSQL connection failed:', err.message);
  console.error('   Please check your DATABASE_URL in backend/.env');
});

pool.on('error', (err) => {
  console.error('Unexpected PG idle client error', err);
});

// Direct pool for schema migrations (uses port 5432, not pgbouncer)
export const directPool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
