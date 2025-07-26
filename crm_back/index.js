require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
import cron from 'node-cron'
import { reemplazarTabla } from './controllers/userTableController.js'
import './utils/escuchaSupa.js'

const mensajeRoutes = require('./routes/mensajeRoutes');
const telegramRoutes = require('./routes/telegramRoutes');

const app = express();
const port = process.env.PORT || 3001;


//Ejecutar todos los días a las 2:00 AM.
cron.schedule('0 2 * * *', async () => {
  console.log('🕑 Iniciando sincronización con Botpress...')
  try {
    await reemplazarTabla()
    console.log('✅ Sincronización completada exitosamente')
  } catch (err) {
    console.error('❌ Error durante la sincronización:', err)
  }
})

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

require('./sockets/socketHandler')(io);

// Rutas
app.use(mensajeRoutes(io));
app.use(telegramRoutes);

// Iniciar servidor
server.listen(port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
});
