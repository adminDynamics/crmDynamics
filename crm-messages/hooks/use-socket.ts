"use client"

import { useEffect, useState, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { loadHistoricalMessages, saveMessage } from "@/lib/supabase"
import { detectMessageFormat, generateTempId } from "@/lib/utils"
import type { Message, Conversation, SupabaseMessage } from "@/types/messages"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Función para crear/actualizar conversaciones basada en mensajes
  const updateConversationsFromMessages = useCallback((allMessages: Message[]) => {
    if (allMessages.length === 0) {
      setConversations([])
      return
    }

    const conversationsMap = new Map<string, Conversation>()

    // Procesar cada mensaje ordenado por timestamp
    const sortedMessages = [...allMessages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    sortedMessages.forEach((message) => {
      // CAMBIO CLAVE: Usar conversation_id como clave principal para agrupar
      const convKey = message.conversationId

      if (conversationsMap.has(convKey)) {
        // Agregar a conversación existente
        const conv = conversationsMap.get(convKey)!
        conv.messages.push(message)
        conv.lastMessage = message.mensaje
        conv.lastMessageTime = message.timestamp

        // Actualizar userId si viene uno válido (no "desconocido")
        if (message.userId && message.userId !== "desconocido" && conv.userId === "desconocido") {
          conv.userId = message.userId
        }

        // Actualizar chatId si no lo tenía
        if (message.chatId && !conv.chatId) {
          conv.chatId = message.chatId
        }
      } else {
        // Crear nueva conversación
        conversationsMap.set(convKey, {
          conversationId: message.conversationId,
          userId: message.userId || "Usuario",
          chatId: message.chatId,
          messages: [message],
          lastMessage: message.mensaje,
          lastMessageTime: message.timestamp,
          unreadCount: 0,
        })
      }
    })

    // Convertir a array y ordenar por último mensaje (más reciente primero)
    const conversationsArray = Array.from(conversationsMap.values()).sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime(),
    )

    setConversations(conversationsArray)
  }, [])

  // Cargar mensajes históricos al inicializar
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const historicalMessages = await loadHistoricalMessages()

        // Convertir mensajes de Supabase al formato interno
        const convertedMessages: Message[] = historicalMessages.map((msg: SupabaseMessage) => ({
          id: msg.id,
          mensaje: msg.message, // Cambiar de msg.mensaje a msg.message
          tipo: msg.tipo,
          formato: msg.formato || detectMessageFormat(msg.message), // Detectar formato automáticamente si no está definido
          userId: msg.user_id,
          conversationId: msg.conversation_id,
          chatId: msg.chat_id,
          timestamp: new Date(msg.timestamp),
        }))

        setMessages(convertedMessages)
        console.log(`✅ Cargadas ${convertedMessages.length} mensajes históricos`)
      } catch (error) {
        console.error("❌ Error cargando historial:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [])

  // Actualizar conversaciones cuando cambien los mensajes
  useEffect(() => {
    updateConversationsFromMessages(messages)
  }, [messages, updateConversationsFromMessages])

  useEffect(() => {
    const socketInstance = io("https://crmdynamics.onrender.com", {
      transports: ["websocket", "polling"],
      timeout: 20000,
    })

    socketInstance.on("connect", () => {
      console.log("✅ Conectado al WebSocket")
      setIsConnected(true)
      setConnectionError(null)
    })

    socketInstance.on("disconnect", () => {
      console.log("❌ Desconectado del WebSocket")
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("🔥 Error de conexión:", error)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    // ESCUCHAR MENSAJES NUEVOS
    socketInstance.on("mensaje", async (data: any) => {
      try {
        console.log("📨 Mensaje recibido por WebSocket:", data)

        // Validar que el mensaje tenga contenido
        if (!data.message || data.message.trim() === "") {
          console.log("⚠️ Mensaje vacío ignorado")
          return
        }

        const newMessage: Message = {
          id: generateTempId(), // ID temporal hasta que Supabase genere el real
          mensaje: data.message.trim(),
          tipo: data.tipo || "cliente",
          formato: data.formato || detectMessageFormat(data.message.trim()),
          userId: data.user_id || "Usuario",
          conversationId: data.conversation_id || `conv_${data.user_id}`,
          chatId: data.chat_id,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        }

        console.log("🔄 Mensaje procesado:", {
          conversationId: newMessage.conversationId,
          userId: newMessage.userId,
          mensaje: newMessage.mensaje,
          tipo: newMessage.tipo,
        })

        // Verificar si el mensaje ya existe para evitar duplicados
        setMessages((prevMessages) => {
          const exists = prevMessages.some(
            (msg) =>
              msg.mensaje === newMessage.mensaje &&
              msg.conversationId === newMessage.conversationId &&
              Math.abs(msg.timestamp.getTime() - newMessage.timestamp.getTime()) < 5000,
          )

          if (exists) {
            console.log("⚠️ Mensaje duplicado detectado, ignorando")
            return prevMessages
          }

          console.log(`✅ Agregando mensaje a conversación ${newMessage.conversationId}`)

          // Guardar en Supabase de forma asíncrona
          saveMessage({
            mensaje: newMessage.mensaje,
            tipo: newMessage.tipo,
            formato: newMessage.formato,
            user_id: newMessage.userId,
            conversation_id: newMessage.conversationId,
            chat_id: newMessage.chatId,
            timestamp: newMessage.timestamp.toISOString(),
          }).then((result) => {
            if (result.success && result.id) {
              // Actualizar el ID del mensaje con el generado por Supabase
              setMessages((prevMessages) => 
                prevMessages.map(msg => 
                  msg.id === newMessage.id ? { ...msg, id: result.id! } : msg
                )
              )
            }
          }).catch((error) => {
            console.error("❌ Error guardando mensaje en Supabase:", error)
          })

          return [...prevMessages, newMessage]
        })
      } catch (error) {
        console.error("❌ Error procesando mensaje:", error)
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const sendTelegramMessage = useCallback(
    async (chatId: string, mensaje: string, conversationId: string, userId: string) => {
      try {
        const response = await fetch("https://crmdynamics.onrender.com/api/responderTelegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, mensaje }),
        })

        if (response.ok) {
          // Crear mensaje local para mostrar en el CRM
          const localMessage: Message = {
            id: generateTempId(), // ID temporal hasta que Supabase genere el real
            mensaje: mensaje,
            tipo: "bot",
            formato: "texto", // Los mensajes del bot son siempre texto por ahora
            userId: userId,
            conversationId: conversationId,
            chatId: chatId,
            timestamp: new Date(),
          }

          // Guardar en Supabase
          const saveResult = await saveMessage({
            mensaje: localMessage.mensaje,
            tipo: localMessage.tipo,
            formato: localMessage.formato,
            user_id: localMessage.userId,
            conversation_id: localMessage.conversationId,
            chat_id: localMessage.chatId,
            timestamp: localMessage.timestamp.toISOString(),
          })

          if (saveResult.success && saveResult.id) {
            // Actualizar el ID del mensaje con el generado por Supabase
            localMessage.id = saveResult.id
          }

          // Agregar al estado (se unificará automáticamente con la conversación existente)
          setMessages((prev) => [...prev, localMessage])

          return { success: true }
        } else {
          return { success: false, error: `Error ${response.status}` }
        }
      } catch (error) {
        return { success: false, error: "Error de conexión" }
      }
    },
    [],
  )

  const getConversation = useCallback(
    (conversationId: string) => {
      return conversations.find((conv) => conv.conversationId === conversationId)
    },
    [conversations],
  )

  return {
    messages,
    conversations,
    isConnected,
    connectionError,
    isLoadingHistory,
    sendTelegramMessage,
    getConversation,
  }
}
