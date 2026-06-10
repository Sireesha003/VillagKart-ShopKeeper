import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
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
server.listen(PORT, () => {
  console.log(`✅  VillagKart backend running on http://localhost:${PORT}`);
  console.log(`   API base: http://localhost:${PORT}/api`);
  console.log(`   Seed:     POST http://localhost:${PORT}/api/seed`);
});
