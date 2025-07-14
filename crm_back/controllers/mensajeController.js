const supabase = require('../config/supabaseClient');
const limpiarConversationId = require('../utils/limpiarConversationId');

let ultimoMensaje = null;

const recibirMensaje = (io) => async (req, res) => {
  let { tipo, mensaje, userId, conversationId, chatId, timestamp } = req.body;

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
  console.log('Enviando mensaje por WebSocket:', JSON.stringify(nuevoMensaje, null, 2));
  io.emit('mensaje', nuevoMensaje);
  

  try {
    await supabase.from('messages').insert([nuevoMensaje]);
  } catch (err) {
    console.error('❌ Error al guardar en Supabase:', err.message || err);
  }

  res.status(200).json({ success: true, message: 'Mensaje procesado correctamente' });
};

const obtenerUltimoMensaje = async (req, res) => {
  if (ultimoMensaje) {
    return res.status(200).json(ultimoMensaje);
  } else {
    // Buscar el último mensaje en la base de datos
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);
      if (error) {
        return res.status(500).json({ success: false, message: 'Error al consultar la base de datos', error: error.message });
      }
      if (data && data.length > 0) {
        return res.status(200).json(data[0]);
      } else {
        return res.status(404).json({ success: false, message: 'No hay mensajes almacenados' });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error inesperado', error: err.message });
    }
  }
};

const insertarMensajeManual = async (req, res) => {
  const { conversation_id, message, timestamp, user_id, chat_id } = req.body;

  if (!conversation_id || !message || !timestamp || !user_id || !chat_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const { data, error } = await supabase
    .from('mensajes')
    .insert([{ conversation_id, message, timestamp, user_id, chat_id }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ success: true, mensajeInsertado: data[0] });
};

module.exports = {
  recibirMensaje,
  obtenerUltimoMensaje,
  insertarMensajeManual,
};
