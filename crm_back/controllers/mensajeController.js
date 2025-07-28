import supabase from '../config/supabaseClient.js';
import limpiarConversationId from '../utils/limpiarConversationId.js';

let ultimoMensaje = null;

export const recibirMensaje = (io) => async (req, res) => {
  let { tipo, mensaje, userId, conversationId, chatId, timestamp, formato } = req.body;

  if (!tipo || !mensaje || !userId || !chatId) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos: tipo, mensaje, userId o chatId',
    });
  }

  conversationId = limpiarConversationId(conversationId);

  // Si no viene 'formato' explícito desde el request, lo detectamos
  if (!formato) {
    if (mensaje.startsWith('http') && mensaje.includes('.oga')) formato = 'audio';
    else if (mensaje.startsWith('http') && mensaje.match(/\.(jpg|jpeg|png|webp)/i)) formato = 'imagen';
    else if (mensaje.startsWith('http') && mensaje.match(/\.(pdf|docx?|xlsx?|pptx?)/i)) formato = 'documento';
    else if (mensaje.startsWith('http')) formato = 'archivo';
    else formato = 'texto';
  }

  const nuevoMensaje = {
    tipo,
    formato,
    message: mensaje,
    user_id: userId,
    conversation_id: conversationId || null,
    chat_id: chatId,
    timestamp: timestamp ? new Date(timestamp) : new Date()
  };

  ultimoMensaje = nuevoMensaje;
  console.log('📡 Enviando mensaje por WebSocket:', JSON.stringify(nuevoMensaje, null, 2));
  io.emit('mensaje', nuevoMensaje);

  try {
    await supabase.from('messages').insert([nuevoMensaje]);
  } catch (err) {
    console.error('❌ Error al guardar en Supabase:', err.message || err);
  }

  res.status(200).json({ success: true, message: 'Mensaje procesado correctamente' });
};


export const obtenerUltimoMensaje = async (req, res) => {
  if (ultimoMensaje) {
    return res.status(200).json(ultimoMensaje);
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error al consultar Supabase:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error al consultar la base de datos',
        error: error.message
      });
    }

    if (Array.isArray(data) && data.length > 0) {
      return res.status(200).json(data[0]);
    } else {
      return res.status(404).json({
        success: false,
        message: 'No hay mensajes almacenados'
      });
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Error inesperado',
      error: err.message
    });
  }
};


export const insertarMensajeManual = async (req, res) => {
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
