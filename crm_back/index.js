require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let ultimoMensaje = null;

app.use(express.json());
app.use(cors());

// 🔁 Remueve 'conv_' si está presente
function limpiarConversationId(id) {
  return id?.startsWith('conv_') ? id.slice(5) : id;
}

// Recibir mensaje
app.post('/api/recibirMensaje', async (req, res) => {
  let { tipo, mensaje, userId, conversationId, chatId, timestamp } = req.body;
  console.log('****************************Recibido mensaje:', req.body);

  if (!tipo || !mensaje || !userId || !chatId) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos: tipo, mensaje, userId o chatId',
    });
  }

  conversationId = limpiarConversationId(conversationId);

  const nuevoMensaje = {
    tipo,
    message: mensaje,
    user_id: userId,
    conversation_id: conversationId || null,
    chat_id: chatId,
    timestamp: timestamp ? new Date(timestamp) : new Date()
  };

  ultimoMensaje = nuevoMensaje;

  console.log('🟢 Enviando por WebSocket:', JSON.stringify(nuevoMensaje, null, 2));
  io.emit('mensaje', nuevoMensaje);

  try {
    const { data, error } = await supabase.from('messages').insert([nuevoMensaje]);
  } catch (err) {
    console.error('❌ Error inesperado al guardar en Supabase:', err.message || err);
  }

  return res.status(200).json({ success: true, message: 'Mensaje procesado correctamente' });
});

// Responder por Telegram
app.post('/api/responderTelegram', async (req, res) => {
  const { chatId, mensaje } = req.body;

  if (!chatId || !mensaje) {
    return res.status(400).json({ success: false, message: 'Faltan datos: chatId o mensaje' });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: mensaje }),
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

// Último mensaje
app.get('/api/obtenerMensaje', (req, res) => {
  if (ultimoMensaje) {
    console.log('Último mensaje entregado');
    return res.status(200).json(ultimoMensaje);
  } else {
    return res.status(404).json({ success: false, message: 'No hay mensajes almacenados' });
  }
});

// WebSocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente WebSocket conectado');

  socket.on('mensaje', (data) => {
    ultimoMensaje = data;
    io.emit('mensaje', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente WebSocket desconectado');
  });
});

server.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});

//PRUEBA SUPABASE
app.post('/mensajes', async (req, res) => {
  const { conversation_id, message, timestamp, user_id, chat_id } = req.body;

  // Validación básica
  if (!conversation_id || !message || !timestamp || !user_id || !chat_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const { data, error } = await supabase
    .from('mensajes')
    .insert([
      { conversation_id, message, timestamp, user_id, chat_id }
    ]);

  if (error) {
    console.error('Error al insertar mensaje:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ success: true, mensajeInsertado: data[0] });
});