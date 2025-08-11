import supabase from '../config/supabaseClient.js';
import limpiarConversationId from '../utils/limpiarConversationId.js';
import crypto from 'crypto';

let ultimoMensaje = null;

// Observabilidad básica: tracking de requests recientes por posible duplicación
const recentRequests = new Map(); // key -> { count, firstAt, lastAt }
const RECENT_TTL_MS = 60_000; // 1 minuto de ventana de observación

function cleanupRecent() {
  const now = Date.now();
  for (const [key, info] of recentRequests.entries()) {
    if (now - info.lastAt > RECENT_TTL_MS) {
      recentRequests.delete(key);
    }
  }
}

function computeDedupeKey({ chatId, conversationId, mensaje, tipo, messageId, eventId }) {
  const raw = [chatId, conversationId, mensaje, tipo, messageId || '', eventId || '']
    .map((v) => (v === undefined || v === null ? '' : String(v)))
    .join('|');
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

function getRequestId(req) {
  return (
    req.headers['x-request-id'] ||
    req.headers['x-correlation-id'] ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

// Cache de claves procesadas para evitar duplicados de emisión/insert en una ventana corta
const processedKeys = new Map(); // dedupeKey -> lastProcessedAt
const PROCESSED_TTL_MS = 30_000; // 30s

function cleanupProcessed() {
  const now = Date.now();
  for (const [key, lastAt] of processedKeys.entries()) {
    if (now - lastAt > PROCESSED_TTL_MS) processedKeys.delete(key);
  }
}

export const recibirMensaje = (io) => async (req, res) => {
  const body = req.body || {};
  // Normalización: aceptar payloads de Botpress (camelCase) y CRM (snake_case)
  let tipo = body.tipo;
  let mensaje = body.mensaje ?? body.message;
  let userId = body.userId ?? body.user_id;
  let conversationId = body.conversationId ?? body.conversation_id;
  let chatId = body.chatId ?? body.chat_id;
  let { timestamp, formato, messageId } = body;

  const requestId = getRequestId(req);
  const eventId = req.headers['x-bp-event-id'] || req.headers['x-event-id'] || null;

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

  // Logging de request entrante con clave de deduplicación
  const dedupeKey = computeDedupeKey({
    chatId,
    conversationId,
    mensaje,
    tipo,
    messageId,
    eventId,
  });
  const now = Date.now();
  const info = recentRequests.get(dedupeKey) || { count: 0, firstAt: now, lastAt: now };
  info.count += 1;
  info.lastAt = now;
  recentRequests.set(dedupeKey, info);
  cleanupRecent();

  console.log('🛬 [IN] /api/recibirMensaje', {
    requestId,
    eventId,
    messageId: messageId || null,
    dedupeKey,
    occurrencesInLastMinute: info.count,
    body: {
      tipo,
      formato,
      userId,
      chatId,
      conversationId,
      timestamp,
      mensajePreview: typeof mensaje === 'string' ? mensaje.slice(0, 120) : null,
    },
  });

  // Evitar duplicados procesados recientemente (antes de DB/WS)
  const alreadyProcessedAt = processedKeys.get(dedupeKey);
  if (alreadyProcessedAt && now - alreadyProcessedAt < PROCESSED_TTL_MS) {
    console.warn('⚠️ Duplicado detectado, se omite insert/WS', { requestId, dedupeKey, ageMs: now - alreadyProcessedAt });
    return res.status(200).json({
      success: true,
      message: 'Duplicado reciente ignorado',
      meta: {
        requestId,
        eventId,
        messageId: messageId || null,
        dedupeKey,
        duplicate: true,
        occurrencesInLastMinute: recentRequests.get(dedupeKey)?.count || 1,
      }
    });
  }

  try {
    console.log('📝 [DB] Insert intento -> messages', { requestId, dedupeKey });
    const { data, error } = await supabase
      .from('messages')
      .insert([nuevoMensaje])
      .select('id, timestamp, chat_id');
    if (error) {
      console.error('❌ [DB] Insert error -> messages', { requestId, dedupeKey, error: error.message });
      return res.status(500).json({
        success: false,
        message: 'Error al guardar el mensaje',
        error: error.message,
        meta: { requestId, dedupeKey }
      });
    }

    // Marcamos como procesado y emitimos por WebSocket SOLO tras insert exitoso
    processedKeys.set(dedupeKey, Date.now());
    cleanupProcessed();

    ultimoMensaje = nuevoMensaje;
    console.log('📡 [WS] Emisión -> mensaje', JSON.stringify(nuevoMensaje, null, 2));
    io.emit('mensaje', nuevoMensaje);

    console.log('✅ [DB] Insert ok -> messages', { requestId, dedupeKey, inserted: data });

    return res.status(200).json({
      success: true,
      message: 'Mensaje procesado correctamente',
      meta: {
        requestId,
        eventId,
        messageId: messageId || null,
        dedupeKey,
        duplicate: false,
        occurrencesInLastMinute: recentRequests.get(dedupeKey)?.count || 1,
      }
    });
  } catch (err) {
    console.error('❌ [DB] Excepción al guardar en Supabase:', { requestId, dedupeKey, error: err.message || err });
    return res.status(500).json({
      success: false,
      message: 'Excepción al guardar en Supabase',
      error: err.message || String(err),
      meta: { requestId, dedupeKey }
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

  const requestId = getRequestId(req);
  console.log('🛠️ [IN] /mensajes (manual insert)', {
    requestId,
    body: { conversation_id, user_id, chat_id, timestamp, messagePreview: String(message).slice(0, 120) },
  });

  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id, message, timestamp, user_id, chat_id }])
    .select('id, timestamp, chat_id');

  if (error) {
    console.error('❌ [DB] Insert error -> messages (manual)', { requestId, error: error.message });
    return res.status(500).json({ error: error.message });
  }

  console.log('✅ [DB] Insert ok -> messages (manual)', { requestId, inserted: data });
  res.status(201).json({ success: true, mensajeInsertado: data[0], meta: { requestId } });
};
