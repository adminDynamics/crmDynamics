export type MessageFormat = "texto" | "audio" | "imagen" | "documento" | "archivo"
export type MessageType = "cliente" | "bot" | "encargado"

export interface Message {
  id: string
  mensaje: string
  tipo: MessageType
  formato: MessageFormat
  userId: string
  conversationId: string
  chatId?: string
  timestamp: Date
}

export interface Conversation {
  conversationId: string
  userId: string
  chatId?: string
  messages: Message[]
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

export interface SupabaseMessage {
  id: string
  message: string
  tipo: MessageType
  formato: MessageFormat
  user_id: string
  conversation_id: string
  chat_id: string
  timestamp: string
  created_at?: string
}

export interface MessageContentProps {
  mensaje: string
  formato: MessageFormat
} 