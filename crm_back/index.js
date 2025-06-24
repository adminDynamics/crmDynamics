require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http');
const { Server } = require('socket.io');

const app = express()
const port = process.env.PORT || 3001

const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
let ultimoMensaje = null;

app.use(express.json());
app.use(cors());

// Validar y registrar los mensajes recibidos
app.post('/api/recibirMensaje', (req, res) => {
    const { tipo, mensaje, userId, conversationId, chatId, timestamp } = req.body;

if (!tipo || !mensaje || !userId || !chatId) {
    console.warn('❌ Mensaje recibido incompleto:', req.body);
    return res.status(400).json({ success: false, message: 'Faltan datos requeridos: tipo, mensaje, userId o chatId' });
}
const nuevoMensaje = {
    tipo,
    mensaje,
    userId,
    conversationId,
    chatId,
    timestamp: timestamp || new Date().toISOString()
  };

    ultimoMensaje = nuevoMensaje;
    console.log('✅ Mensaje recibido y emitido:', nuevoMensaje);
    io.emit('mensaje', nuevoMensaje);

    return res.status(200).json({ success: true, message: 'Mensaje procesado correctamente' });
});

// Responder via api telegram.
app.post('/api/responderTelegram', async (req, res) => {
    const { chatId, mensaje } = req.body;
  
    if (!chatId || !mensaje) {
      return res.status(400).json({ success: false, message: 'Faltan datos: chatId o mensaje' });
    }
  
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  
    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje
        })
      });
  
      const data = await response.json();
  
      if (data.ok) {
        return res.status(200).json({ success: true, message: 'Mensaje enviado correctamente' });
      } else {
        return res.status(500).json({ success: false, error: data });
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje a Telegram:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

// Ver el último mensaje (opcional)
app.get('/api/obtenerMensaje', (req, res) => {
    if (ultimoMensaje) {
        console.log('📤 Último mensaje entregado vía GET');
        return res.status(200).json(ultimoMensaje);
    } else {
        return res.status(404).json({ success: false, message: 'No hay mensajes almacenados' });
    }
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('🔌 Cliente WebSocket conectado');

    // ❌ Eliminado: reenvío automático del último mensaje
    // Esto evitaba confusión con mensajes viejos al entrar al CRM

    socket.on('mensaje', (data) => {
        ultimoMensaje = data;
        io.emit('mensaje', data);
        console.log('📥 Mensaje recibido desde el cliente y emitido:', data);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Cliente WebSocket desconectado');
    });
});

server.listen(port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${port} (HTTP y WebSocket)`);
});
