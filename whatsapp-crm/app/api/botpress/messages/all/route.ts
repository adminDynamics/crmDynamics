import { type NextRequest, NextResponse } from "next/server"
import { getAllBotpressMessages } from "@/lib/botpress-service"

// Obtener todos los mensajes de Botpress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const messages = await getAllBotpressMessages({ limit, offset })

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
      timestamp: new Date().toISOString(),
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
