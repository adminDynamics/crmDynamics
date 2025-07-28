import supabase from '../config/supabaseClient.js';
import limpiarConversationId from '../utils/limpiarConversationId.js';

let ultimoMensaje = null;

// Tipos de mensaje permitidos
const TIPOS_PERMITIDOS = ['text', 'audio', 'image', 'document', 'file', 'video', 'location', 'contact'];
const FORMATOS_PERMITIDOS = ['texto', 'audio', 'imagen', 'documento', 'archivo', 'video', 'ubicacion', 'contacto'];

// Función de validación de mensaje
const validarMensaje = (mensaje) => {
  if (!mensaje || typeof mensaje !== 'string') {
    return { valido: false, error: 'El mensaje debe ser una cadena de texto válida' };
  }
  
  if (mensaje.trim().length === 0) {
    return { valido: false, error: 'El mensaje no puede estar vacío' };
  }
  
  if (mensaje.length > 4000) {
    return { valido: false, error: 'El mensaje no puede exceder 4000 caracteres' };
  }
  
  return { valido: true };
};

// Función de validación de tipo
const validarTipo = (tipo) => {
  if (!tipo || typeof tipo !== 'string') {
    return { valido: false, error: 'El tipo debe ser una cadena de texto válida' };
  }
  
  if (!TIPOS_PERMITIDOS.includes(tipo.toLowerCase())) {
    return { 
      valido: false, 
      error: `Tipo no permitido. Tipos válidos: ${TIPOS_PERMITIDOS.join(', ')}` 
    };
  }
  
  return { valido: true };
};

// Función de validación de formato
const validarFormato = (formato) => {
  if (!formato || typeof formato !== 'string') {
    return { valido: false, error: 'El formato debe ser una cadena de texto válida' };
  }
  
  if (!FORMATOS_PERMITIDOS.includes(formato.toLowerCase())) {
    return { 
      valido: false, 
      error: `Formato no permitido. Formatos válidos: ${FORMATOS_PERMITIDOS.join(', ')}` 
    };
  }
  
  return { valido: true };
};

// Función de validación de userId
const validarUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    return { valido: false, error: 'El userId debe ser una cadena de texto válida' };
  }
  
  if (userId.trim().length === 0) {
    return { valido: false, error: 'El userId no puede estar vacío' };
  }
  
  if (userId.length > 100) {
    return { valido: false, error: 'El userId no puede exceder 100 caracteres' };
  }
  
  return { valido: true };
};

// Función de validación de chatId
const validarChatId = (chatId) => {
  if (!chatId || typeof chatId !== 'string') {
    return { valido: false, error: 'El chatId debe ser una cadena de texto válida' };
  }
  
  if (chatId.trim().length === 0) {
    return { valido: false, error: 'El chatId no puede estar vacío' };
  }
  
  if (chatId.length > 100) {
    return { valido: false, error: 'El chatId no puede exceder 100 caracteres' };
  }
  
  return { valido: true };
};

// Función de validación de timestamp
const validarTimestamp = (timestamp) => {
  if (!timestamp) {
    return { valido: true, valor: new Date() }; // Si no viene, usamos la fecha actual
  }
  
  const fecha = new Date(timestamp);
  if (isNaN(fecha.getTime())) {
    return { valido: false, error: 'El timestamp debe ser una fecha válida' };
  }
  
  // Verificar que no sea una fecha futura (con tolerancia de 5 minutos)
  const ahora = new Date();
  const cincoMinutos = 5 * 60 * 1000;
  if (fecha.getTime() > ahora.getTime() + cincoMinutos) {
    return { valido: false, error: 'El timestamp no puede ser una fecha futura' };
  }
  
  return { valido: true, valor: fecha };
};

export const recibirMensaje = (io) => async (req, res) => {
  try {
    let { tipo, mensaje, userId, conversationId, chatId, timestamp, formato } = req.body;

    // Validaciones básicas de campos requeridos
    if (!tipo || !mensaje || !userId || !chatId) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios: tipo, mensaje, userId o chatId',
        required: ['tipo', 'mensaje', 'userId', 'chatId']
      });
    }

    // Validaciones específicas
    const validacionMensaje = validarMensaje(mensaje);
    if (!validacionMensaje.valido) {
      return res.status(400).json({
        success: false,
        message: validacionMensaje.error
      });
    }

    const validacionTipo = validarTipo(tipo);
    if (!validacionTipo.valido) {
      return res.status(400).json({
        success: false,
        message: validacionTipo.error
      });
    }

    const validacionUserId = validarUserId(userId);
    if (!validacionUserId.valido) {
      return res.status(400).json({
        success: false,
        message: validacionUserId.error
      });
    }

    const validacionChatId = validarChatId(chatId);
    if (!validacionChatId.valido) {
      return res.status(400).json({
        success: false,
        message: validacionChatId.error
      });
    }

    const validacionTimestamp = validarTimestamp(timestamp);
    if (!validacionTimestamp.valido) {
      return res.status(400).json({
        success: false,
        message: validacionTimestamp.error
      });
    }

    // Validación de formato si viene
    if (formato) {
      const validacionFormato = validarFormato(formato);
      if (!validacionFormato.valido) {
        return res.status(400).json({
          success: false,
          message: validacionFormato.error
        });
      }
    }

    conversationId = limpiarConversationId(conversationId);

    // Detección automática de formato si no viene
    if (!formato) {
      if (mensaje.startsWith('http') && mensaje.includes('.oga')) formato = 'audio';
      else if (mensaje.startsWith('http') && mensaje.match(/\.(jpg|jpeg|png|webp|gif)/i)) formato = 'imagen';
      else if (mensaje.startsWith('http') && mensaje.match(/\.(pdf|docx?|xlsx?|pptx?|txt)/i)) formato = 'documento';
      else if (mensaje.startsWith('http') && mensaje.match(/\.(mp4|avi|mov|wmv)/i)) formato = 'video';
      else if (mensaje.startsWith('http')) formato = 'archivo';
      else formato = 'texto';
    }

    const nuevoMensaje = {
      tipo: tipo.toLowerCase(),
      formato: formato.toLowerCase(),
      message: mensaje.trim(),
      user_id: userId.trim(),
      conversation_id: conversationId || null,
      chat_id: chatId.trim(),
      timestamp: validacionTimestamp.valor
    };

    ultimoMensaje = nuevoMensaje;
    console.log('📡 Enviando mensaje por WebSocket:', JSON.stringify(nuevoMensaje, null, 2));
    io.emit('mensaje', nuevoMensaje);

    try {
      await supabase.from('messages').insert([nuevoMensaje]);
      console.log('✅ Mensaje guardado en Supabase correctamente');
    } catch (err) {
      console.error('❌ Error al guardar en Supabase:', err.message || err);
      // No fallamos la respuesta si no se puede guardar en BD
    }

    res.status(200).json({ 
      success: true, 
      message: 'Mensaje procesado correctamente',
      data: {
        id: nuevoMensaje.timestamp.getTime(),
        tipo: nuevoMensaje.tipo,
        formato: nuevoMensaje.formato
      }
    });

  } catch (error) {
    console.error('❌ Error inesperado en recibirMensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
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
