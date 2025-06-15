import { type NextRequest, NextResponse } from "next/server"
import { saveBotpressMessage, updateConversationStatus } from "@/lib/botpress-service"
import { z } from "zod"

// Schema para validar mensajes de clientes desde Botpress
const ClientMessageSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  userInfo: z.object({
    fullName: z.string(),
    telegramId: z.number(),
  }),
  // Campos opcionales que podrían venir
  message: z.string().optional(),
  messageText: z.string().optional(),
  timestamp: z.string().optional(),
  channel: z.string().optional().default("telegram"),
})

type ClientMessage = z.infer<typeof ClientMessageSchema>

// Manejar mensajes entrantes de clientes con el formato específico
async function handleIncomingMessage(payload: any) {
  console.log("Procesando mensaje entrante del cliente con formato específico")

  try {
    // Validar el payload con el schema
    const validatedData = ClientMessageSchema.parse(payload)

    console.log("Datos validados:", JSON.stringify(validatedData, null, 2))

    const messageData = {
      id: validatedData.messageId,
      conversationId: validatedData.conversationId,
      userId: validatedData.userInfo.telegramId.toString(),
      userName: validatedData.userInfo.fullName,
      userPhone: "", // No disponible en Telegram
      userEmail: "", // No disponible en Telegram
      messageText: validatedData.message || validatedData.messageText || "",
      messageType: "text",
      timestamp: validatedData.timestamp || new Date().toISOString(),
      channel: validatedData.channel || "telegram",
      metadata: {
        telegramId: validatedData.userInfo.telegramId,
        originalPayload: payload,
      },
      direction: "incoming" as const,
    }

    await saveBotpressMessage(messageData)

    // Notificar a los agentes sobre el nuevo mensaje
    await notifyAgentsNewMessage(messageData)

    console.log("Mensaje procesado exitosamente:", messageData.id)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error de validación del schema:", error.errors)
      throw new Error(`Formato de datos inválido: ${error.errors.map((e) => e.message).join(", ")}`)
    }
    throw error
  }
}

// Webhook principal para recibir mensajes de Botpress
export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la petición como JSON
    const payload = await request.json()

    console.log("Webhook recibido de Botpress:", JSON.stringify(payload, null, 2))

    // Si el payload tiene la estructura específica de cliente, procesarlo directamente
    if (payload.conversationId && payload.messageId && payload.userInfo) {
      await handleIncomingMessage(payload)
      return NextResponse.json({
        status: "success",
        message: "Mensaje de cliente procesado correctamente",
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        timestamp: new Date().toISOString(),
      })
    }

    // Si tiene un campo 'type', usar el procesamiento anterior
    if (payload.type) {
      switch (payload.type) {
        case "message_received":
          await handleIncomingMessage(payload)
          break

        case "message_sent":
          await handleOutgoingMessage(payload)
          break

        case "conversation_started":
          await handleConversationStarted(payload)
          break

        case "conversation_ended":
          await handleConversationEnded(payload)
          break

        case "user_joined":
          await handleUserJoined(payload)
          break

        case "bot_response":
          await handleBotResponse(payload)
          break

        default:
          console.log(`Tipo de evento no manejado: ${payload.type}`)
      }
    } else {
      console.log("Formato de payload no reconocido")
      return NextResponse.json({ error: "Formato de payload no reconocido" }, { status: 400 })
    }

    // Responder con éxito a Botpress
    return NextResponse.json({
      status: "success",
      message: "Webhook procesado correctamente",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error procesando webhook de Botpress:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// Manejar respuestas del bot
async function handleBotResponse(payload: any) {
  console.log("Procesando respuesta del bot")

  const messageData = {
    id: payload.id || generateId(),
    conversationId: payload.conversationId || payload.conversation?.id,
    userId: payload.userId || payload.user?.id,
    userName: "Bot",
    messageText: payload.payload?.text || payload.text || "",
    messageType: payload.payload?.type || "text",
    timestamp: payload.createdOn || payload.timestamp || new Date().toISOString(),
    channel: payload.channel || "whatsapp",
    metadata: {
      botId: payload.botId,
      integrationId: payload.integrationId,
      isBot: true,
      confidence: payload.confidence,
      intent: payload.intent,
      payload: payload.payload || {},
    },
    direction: "outgoing" as const,
  }

  await saveBotpressMessage(messageData)
}

// Manejar mensajes enviados por agentes
async function handleOutgoingMessage(payload: any) {
  console.log("Procesando mensaje enviado por agente")

  const messageData = {
    id: payload.id || generateId(),
    conversationId: payload.conversationId || payload.conversation?.id,
    userId: payload.userId || payload.user?.id,
    userName: payload.agent?.name || "Agente",
    agentId: payload.agent?.id,
    messageText: payload.payload?.text || payload.text || "",
    messageType: payload.payload?.type || "text",
    timestamp: payload.createdOn || payload.timestamp || new Date().toISOString(),
    channel: payload.channel || "whatsapp",
    metadata: {
      botId: payload.botId,
      integrationId: payload.integrationId,
      agentId: payload.agent?.id,
      payload: payload.payload || {},
    },
    direction: "outgoing" as const,
  }

  await saveBotpressMessage(messageData)
}

// Manejar inicio de conversación
async function handleConversationStarted(payload: any) {
  console.log("Nueva conversación iniciada")

  await updateConversationStatus(payload.conversationId, "active", {
    startedAt: payload.timestamp || new Date().toISOString(),
    userId: payload.userId,
    channel: payload.channel,
  })
}

// Manejar fin de conversación
async function handleConversationEnded(payload: any) {
  console.log("Conversación finalizada")

  await updateConversationStatus(payload.conversationId, "ended", {
    endedAt: payload.timestamp || new Date().toISOString(),
    reason: payload.reason,
  })
}

// Manejar nuevo usuario
async function handleUserJoined(payload: any) {
  console.log("Nuevo usuario registrado")

  // Aquí podrías crear o actualizar el perfil del usuario
  // await createOrUpdateUser(payload.user)
}

// Función auxiliar para generar IDs
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Función para notificar a los agentes (placeholder)
async function notifyAgentsNewMessage(messageData: any) {
  // Aquí implementarías la lógica para notificar a los agentes
  // Por ejemplo, usando WebSockets, Server-Sent Events, o push notifications
  console.log("Notificando a agentes sobre nuevo mensaje:", messageData.id)
}

// Endpoint GET para verificar que el webhook está funcionando
export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Botpress Webhook",
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: "/api/botpress/webhook",
      send: "/api/botpress/send",
      conversations: "/api/botpress/conversations",
    },
  })
}
