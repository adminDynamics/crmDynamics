require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const mensajeRoutes = require('./routes/mensajeRoutes');
const telegramRoutes = require('./routes/telegramRoutes');

const app = express();
const port = process.env.PORT || 3001;

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
