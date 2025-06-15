// Servicio para gestionar datos de Botpress

interface BotpressMessage {
  id: string
  conversationId: string
  userId: string
  userName: string
  userPhone?: string
  userEmail?: string
  telegramId?: number // Agregar campo para Telegram ID
  messageText: string
  messageType: string
  timestamp: string
  channel: string
  direction: "incoming" | "outgoing"
  agentId?: string
  metadata: {
    botId?: string
    integrationId?: string
    isBot?: boolean
    confidence?: number
    intent?: string
    tags?: Record<string, any>
    telegramId?: number // También en metadata
    files?: Array<{
      url: string
      type: string
      name: string
      size?: number
    }>
    payload?: any
    originalPayload?: any // Para guardar el payload original
    [key: string]: any
  }
}

interface BotpressConversation {
  id: string
  userId: string
  userName: string
  userPhone?: string
  telegramId?: number // Agregar campo para Telegram ID
  status: "active" | "ended" | "paused"
  channel: string
  startedAt: string
  endedAt?: string
  lastMessageAt: string
  messageCount: number
  assignedAgentId?: string
  metadata: Record<string, any>
}

// Limpiar todos los datos de ejemplo
const messages: BotpressMessage[] = []
const conversations: Map<string, BotpressConversation> = new Map()

// Eliminar todas las conversaciones y mensajes de ejemplo
// Los arrays y maps ahora están vacíos

export async function saveBotpressMessage(messageData: BotpressMessage): Promise<void> {
  console.log("Guardando mensaje de Botpress:", messageData.id)

  // En producción, esto se guardaría en tu base de datos
  /*
  const { pool } = require('@/lib/db');
  
  await pool.query(
    `INSERT INTO botpress_messages 
     (id, conversation_id, user_id, user_name, user_phone, message_text, message_type, 
      timestamp, channel, direction, agent_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      messageData.id,
      messageData.conversationId,
      messageData.userId,
      messageData.userName,
      messageData.userPhone,
      messageData.messageText,
      messageData.messageType,
      new Date(messageData.timestamp),
      messageData.channel,
      messageData.direction,
      messageData.agentId,
      JSON.stringify(messageData.metadata)
    ]
  );
  */

  // Para desarrollo, guardamos en memoria
  messages.push(messageData)

  // Actualizar o crear la conversación
  await updateOrCreateConversation(messageData)
}

async function updateOrCreateConversation(messageData: BotpressMessage): Promise<void> {
  const conversationId = messageData.conversationId

  let conversation = conversations.get(conversationId)

  if (!conversation) {
    // Crear nueva conversación
    conversation = {
      id: conversationId,
      userId: messageData.userId,
      userName: messageData.userName,
      userPhone: messageData.userPhone,
      telegramId: messageData.telegramId, // Agregar telegramId
      status: "active",
      channel: messageData.channel,
      startedAt: messageData.timestamp,
      lastMessageAt: messageData.timestamp,
      messageCount: 1,
      assignedAgentId: messageData.agentId,
      metadata: {
        telegramId: messageData.telegramId, // También en metadata
        lastMessageText: messageData.messageText.substring(0, 100),
      },
    }
  } else {
    // Actualizar conversación existente
    conversation.lastMessageAt = messageData.timestamp
    conversation.messageCount += 1
    conversation.metadata.lastMessageText = messageData.messageText.substring(0, 100)
    if (messageData.agentId) {
      conversation.assignedAgentId = messageData.agentId
    }
  }

  conversations.set(conversationId, conversation)
}

export async function updateConversationStatus(
  conversationId: string,
  status: "active" | "ended" | "paused",
  metadata?: Record<string, any>,
): Promise<void> {
  const conversation = conversations.get(conversationId)

  if (conversation) {
    conversation.status = status
    if (status === "ended" && metadata?.endedAt) {
      conversation.endedAt = metadata.endedAt
    }
    if (metadata) {
      conversation.metadata = { ...conversation.metadata, ...metadata }
    }

    conversations.set(conversationId, conversation)
  }

  // En producción, actualizar en la base de datos
  /*
  await pool.query(
    'UPDATE botpress_conversations SET status = $1, metadata = $2, ended_at = $3 WHERE id = $4',
    [status, JSON.stringify(metadata || {}), status === 'ended' ? new Date() : null, conversationId]
  );
  */
}

export async function getBotpressConversations(options: {
  status?: "active" | "ended" | "all"
  limit?: number
  offset?: number
}): Promise<BotpressConversation[]> {
  // En producción, esto consultaría la base de datos
  let result = Array.from(conversations.values())

  if (options.status && options.status !== "all") {
    result = result.filter((conv) => conv.status === options.status)
  }

  // Ordenar por último mensaje (más reciente primero)
  result.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

  // Aplicar paginación
  const offset = options.offset || 0
  const limit = options.limit || 50
  return result.slice(offset, offset + limit)
}

export async function getBotpressMessages(
  conversationId: string,
  options: { limit?: number; offset?: number },
): Promise<BotpressMessage[]> {
  // En producción, esto consultaría la base de datos
  const result = messages.filter((msg) => msg.conversationId === conversationId)

  // Ordenar por timestamp (más antiguo primero)
  result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Aplicar paginación
  const offset = options.offset || 0
  const limit = options.limit || 100
  return result.slice(offset, offset + limit)
}

// Agregar función para obtener todos los mensajes
export async function getAllBotpressMessages(options: {
  limit?: number
  offset?: number
}): Promise<BotpressMessage[]> {
  // En producción, esto consultaría la base de datos
  const result = [...messages]

  // Ordenar por timestamp (más reciente primero)
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Aplicar paginación
  const offset = options.offset || 0
  const limit = options.limit || 50
  return result.slice(offset, offset + limit)
}

export async function getConversationById(conversationId: string): Promise<BotpressConversation | null> {
  return conversations.get(conversationId) || null
}

export async function assignConversationToAgent(conversationId: string, agentId: string): Promise<void> {
  const conversation = conversations.get(conversationId)

  if (conversation) {
    conversation.assignedAgentId = agentId
    conversations.set(conversationId, conversation)
  }

  // En producción, actualizar en la base de datos
  /*
  await pool.query(
    'UPDATE botpress_conversations SET assigned_agent_id = $1 WHERE id = $2',
    [agentId, conversationId]
  );
  */
}
