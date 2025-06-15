import { type NextRequest, NextResponse } from "next/server"
import { getBotpressConversations } from "@/lib/botpress-service"

// Obtener todas las conversaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // active, ended, all
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const conversations = await getBotpressConversations({
      status: status as any,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: conversations,
      pagination: {
        limit,
        offset,
        total: conversations.length, // En producción, esto vendría de la base de datos
      },
    })
  } catch (error) {
    console.error("Error obteniendo conversaciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
