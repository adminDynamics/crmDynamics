import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { reemplazarTabla } from './controllers/userTableController.js';
import './utils/escuchaSupa.js';

import mensajeRoutes from './routes/mensajeRoutes.js';
import telegramRoutes from './routes/telegramRoutes.js';
import supaUsersRoutes from './routes/supaUsersRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

//Ejecutar todos los días a las 2:00 AM.
cron.schedule('0 2 * * *', async () => {
  console.log('🕑 Iniciando sincronización con Botpress...');
  try {
    await reemplazarTabla();
    console.log('✅ Sincronización completada exitosamente');
  } catch (err) {
    console.error('❌ Error durante la sincronización:', err);
  }
});

app.use(express.json());
app.use(cors());

// Middleware de observabilidad de requests entrantes
app.use((req, res, next) => {
  const startedAt = Date.now();
  const requestId =
    req.headers['x-request-id'] ||
    req.headers['x-correlation-id'] ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const eventId = req.headers['x-bp-event-id'] || req.headers['x-event-id'] || null;
  const bodyPreview =
    req.method !== 'GET' && req.body
      ? JSON.stringify(req.body).slice(0, 300)
      : null;

  console.log('➡️  [REQ]', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    eventId,
    bodyPreview,
  });

  res.on('finish', () => {
    console.log('⬅️  [RES]', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

import('./sockets/socketHandler.js').then(module => module.default(io));

// Rutas
app.use(mensajeRoutes(io));
app.use(telegramRoutes);
app.use(supaUsersRoutes);

// Iniciar servidor
server.listen(port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
});
