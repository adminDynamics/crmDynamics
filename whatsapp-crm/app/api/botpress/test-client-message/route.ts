import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Schema para validar mensajes de clientes
const ClientMessageSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  userInfo: z.object({
    fullName: z.string(),
    telegramId: z.number(),
  }),
  message: z.string().optional(),
  timestamp: z.string().optional(),
  channel: z.string().optional(),
})

// Endpoint para probar el formato específico de mensajes de cliente
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log("Probando formato de mensaje de cliente:", JSON.stringify(payload, null, 2))

    // Validar el payload
    const validatedData = ClientMessageSchema.parse(payload)

    // Simular el procesamiento
    const processedMessage = {
      id: validatedData.messageId,
      conversationId: validatedData.conversationId,
      userId: validatedData.userInfo.telegramId.toString(),
      userName: validatedData.userInfo.fullName,
      telegramId: validatedData.userInfo.telegramId,
      messageText: validatedData.message || "",
      timestamp: validatedData.timestamp || new Date().toISOString(),
      channel: validatedData.channel || "telegram",
      status: "processed",
    }

    console.log("Mensaje procesado:", JSON.stringify(processedMessage, null, 2))

    return NextResponse.json({
      success: true,
      message: "Formato validado correctamente",
      originalPayload: payload,
      processedData: processedMessage,
      validation: "passed",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error de validación:", error.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Formato de datos inválido",
          details: error.errors,
          expectedFormat: {
            conversationId: "string",
            messageId: "string",
            userInfo: {
              fullName: "string",
              telegramId: "number",
            },
            message: "string (opcional)",
            timestamp: "string (opcional)",
            channel: "string (opcional)",
          },
        },
        { status: 400 },
      )
    }

    console.error("Error procesando mensaje de prueba:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// GET para mostrar el formato esperado
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/botpress/test-client-message",
    method: "POST",
    description: "Endpoint para probar el formato específico de mensajes de cliente",
    expectedFormat: {
      conversationId: "string",
      messageId: "string",
      userInfo: {
        fullName: "string",
        telegramId: "number",
      },
      message: "string (opcional)",
      timestamp: "string (opcional)",
      channel: "string (opcional, default: telegram)",
    },
    example: {
      conversationId: "conv_123456789",
      messageId: "msg_987654321",
      userInfo: {
        fullName: "Juan Pérez",
        telegramId: 123456789,
      },
      message: "Hola, necesito ayuda con mi pedido",
      timestamp: "2024-01-15T10:30:00.000Z",
      channel: "telegram",
    },
  })
}
