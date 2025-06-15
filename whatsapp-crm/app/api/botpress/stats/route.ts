import { type NextRequest, NextResponse } from "next/server"
import { getAllBotpressMessages, getBotpressConversations } from "@/lib/botpress-service"

// Obtener estadísticas de Botpress
export async function GET(request: NextRequest) {
  try {
    const messages = await getAllBotpressMessages({ limit: 1000 })
    const conversations = await getBotpressConversations({ status: "all", limit: 1000 })

    const stats = {
      totalMessages: messages.length,
      totalConversations: conversations.length,
      activeConversations: conversations.filter((c) => c.status === "active").length,
      lastMessageTime: messages.length > 0 ? messages[0].timestamp : null,
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
