import { type NextRequest, NextResponse } from "next/server"
import { getBotpressMessages } from "@/lib/botpress-service"

// Obtener mensajes de una conversación específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!conversationId) {
      return NextResponse.json({ error: "ID de conversación requerido" }, { status: 400 })
    }

    const messages = await getBotpressMessages(conversationId, { limit, offset })

    return NextResponse.json({
      success: true,
      conversationId,
      data: messages,
      pagination: {
        limit,
        offset,
        total: messages.length,
      },
    })
  } catch (error) {
    console.error("Error obteniendo mensajes:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
