import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { fetchFiles } from './fetchBucket';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ── CORS ───────────────────────────────────────────────────────────────────
// Allowed origins: explicit list from env + always allow *.vercel.app & localhost
const extraOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // same-origin / non-browser requests
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (extraOrigins.includes('*') || extraOrigins.includes(origin)) return true;
  return false;
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());


// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Socket.IO ──────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join:store', ({ storeId }) => {
    socket.join(`store_${storeId}`);
    console.log(`[Socket] ${socket.id} joined store_${storeId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Export io so controllers can emit events
export { io };

// ── Start Server ───────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  VillagKart backend running on port ${PORT}`);
  console.log(`   API base: /api`);
  console.log(`   Health:   GET /health`);
  console.log(`   Seed:     POST /api/seed`);
  console.log(`   CORS allowed: *.vercel.app, localhost${extraOrigins.length ? ', ' + extraOrigins.join(', ') : ''}`);
  fetchFiles();
});
