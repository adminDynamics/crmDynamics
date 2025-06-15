import { type NextRequest, NextResponse } from "next/server"

// Endpoint para enviar mensajes a Botpress (desde el CRM hacia el bot)
export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId, message, messageType = "text", agentId } = await request.json()

    // Validar datos requeridos
    if (!conversationId || !userId || !message) {
      return NextResponse.json({ error: "conversationId, userId y message son requeridos" }, { status: 400 })
    }

    // Preparar el payload para enviar a Botpress
    const botpressPayload = {
      type: "message",
      conversationId,
      userId,
      payload: {
        type: messageType,
        text: message,
      },
      metadata: {
        source: "crm",
        agentId: agentId,
        timestamp: new Date().toISOString(),
      },
    }

    console.log("Enviando mensaje a Botpress:", JSON.stringify(botpressPayload, null, 2))

    // Aquí harías la llamada HTTP a la API de Botpress
    // const botpressResponse = await fetch('https://your-botpress-instance.com/api/v1/chat/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.BOTPRESS_API_TOKEN}`
    //   },
    //   body: JSON.stringify(botpressPayload)
    // });

    // Por ahora, simulamos una respuesta exitosa
    const simulatedResponse = {
      id: generateId(),
      conversationId,
      userId,
      status: "sent",
      timestamp: new Date().toISOString(),
    }

    // Guardar el mensaje enviado en nuestra base de datos
    // await saveBotpressMessage({
    //   ...botpressPayload,
    //   id: simulatedResponse.id,
    //   direction: 'outgoing'
    // });

    return NextResponse.json({
      success: true,
      message: "Mensaje enviado a Botpress",
      data: simulatedResponse,
    })
  } catch (error) {
    console.error("Error enviando mensaje a Botpress:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
