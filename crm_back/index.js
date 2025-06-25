require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let ultimoMensaje = null;

app.use(express.json());
app.use(cors());

// Validar y registrar los mensajes recibidos
app.post('/api/recibirMensaje', async (req, res) => {
  const { tipo, mensaje, userId, conversationId, chatId, timestamp } = req.body;

  if (!tipo || !mensaje || !userId || !chatId || !conversationId) {
    console.warn('❌ Mensaje recibido incompleto:', req.body);
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos: tipo, mensaje, userId, chatId o conversationId',
    });
  }

  const cleanConversationId = conversationId.replace('conv_', '');

  // Verificar si existe la conversación
  const { data: existingConv, error: checkError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', cleanConversationId)
    .single();

  if (!existingConv) {
    const { error: insertConvError } = await supabase
      .from('conversations')
      .insert([{ id: cleanConversationId }]);

    if (insertConvError) {
      console.error('❌ No se pudo crear la conversación:', insertConvError);
    } else {
      console.log('🆕 Conversación creada en Supabase');
    }
  }

  const nuevoMensaje = {
    conversation_id: cleanConversationId,
    sender: tipo,
    message: mensaje,
    timestamp: timestamp || new Date().toISOString(),
  };

  ultimoMensaje = nuevoMensaje;
  console.log('✅ Mensaje recibido y emitido:', req.body);
  io.emit('mensaje', req.body);

  try {
    const { data, error } = await supabase.from('messages').insert([nuevoMensaje]);

    if (error) {
      console.error('❌ Error guardando en Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('🗃️ Mensaje guardado en Supabase:', data);
    }
  } catch (err) {
    console.error('❌ Error inesperado al guardar en Supabase:', err.message || err);
  }

  return res.status(200).json({ success: true, message: 'Mensaje procesado correctamente' });
});

// Responder via api telegram
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
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente WebSocket conectado');

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
