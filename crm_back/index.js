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

// ✅ Validación reutilizable para mensajes
function validarMensajeBody(body) {
  const { tipo, mensaje, userId, conversationId, chatId, timestamp } = body;
  if (!tipo || !mensaje || !userId || !chatId) {
    return { valido: false, mensaje: 'Faltan datos: tipo, mensaje, userId o chatId' };
  }
  return { valido: true };
}

// Recibir mensaje
app.post('/api/recibirMensaje', async (req, res) => {
  const validacion = validarMensajeBody(req.body);
  if (!validacion.valido) {
    return res.status(400).json({
      success: false,
      message: validacion.mensaje,
    });
  }

  let { tipo, mensaje, userId, conversationId, chatId, timestamp } = req.body;
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
  
    if (error) {
      console.error('❌ Error al guardar en Supabase:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        success: false,
        message: 'Error al guardar en la base de datos',
        error
      });
    }
  } catch (err) {
    console.error('❌ Error inesperado al guardar en Supabase:', err.message || err);
    return res.status(500).json({
      success: false,
      message: 'Error inesperado al guardar en la base de datos',
      error: err.message
    });
  }
});

app.post('/api/responderTelegram', async (req, res) => {
  const { chatId, mensaje, userId, conversationId } = req.body;

  if (!chatId || !mensaje || !userId || !conversationId) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos: chatId, mensaje, userId o conversationId'
    });
  }

  try {
    // Enviar mensaje a Telegram
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: mensaje }),
    });

    const data = await response.json();

    if (!data.ok) {
      return res.status(500).json({ success: false, error: data });
    }

    // Guardar el mensaje en Supabase como operador
    const nuevoMensaje = {
      tipo: 'operador',
      message: mensaje,
      user_id: userId,
      conversation_id: conversationId,
      chat_id: chatId,
      timestamp: new Date()
    };

    const { error } = await supabase.from('messages').insert([nuevoMensaje]);
    if (error) {
      console.error('❌ Error al guardar en Supabase:', error.message || error);
    }

    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado y guardado correctamente'
    });

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