"use client"

import { Search, Hash, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSocket } from "@/hooks/use-socket"
import { setBotActivoTrueByTelegramId } from "@/lib/supabase"

interface ConversationsListProps {
  selectedConversation: string | null
  onSelectConversation: (conversationId: string) => void
}

export function ConversationsList({ selectedConversation, onSelectConversation }: ConversationsListProps) {
  const { conversations, isLoadingHistory } = useSocket()

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Ahora"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const truncateMessage = (message: string | undefined | null, maxLength = 50) => {
    if (!message) return "Sin mensaje"
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message
  }

  const handleSelectConversation = (conv: any) => {
    // Usar conversationId como identificador
    onSelectConversation(conv.conversationId)
  }

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Conversaciones</h2>
          {isLoadingHistory && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Buscar..." className="pl-10" />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingHistory ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-600" />
            <p>Cargando conversaciones...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Hash className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay conversaciones</p>
            <p className="text-xs mt-2">Las conversaciones aparecerán aquí cuando lleguen mensajes</p>
          </div>
        ) : (
          <div>
            {conversations.map((conv) => (
              <div
                key={conv.conversationId}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conv.conversationId ? "bg-purple-50 border-r-2 border-purple-500" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {conv.userId.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium truncate">{conv.userId}</h3>
                      <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        onClick={async e => {
                          e.stopPropagation();
                          if (!conv.chatId) {
                            alert("No se encontró telegram_id para este usuario.");
                            return;
                          }
                          const ok = await setBotActivoTrueByTelegramId(conv.chatId)
                          if (ok) {
                            alert("Chat cerrado correctamente (bot_activo=true en Supabase)")
                          } else {
                            alert("Error al cerrar el chat en Supabase")
                          }
                        }}
                      >
                        Cerrar Chat
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{truncateMessage(conv.lastMessage)}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">{conv.messages?.length || 0} mensajes</p>
                      {(conv.unreadCount || 0) > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {(conv.unreadCount || 0) > 99 ? "99+" : conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {conversations.length} conversación{conversations.length !== 1 ? "es" : ""}
          {isLoadingHistory && " • Cargando historial..."}
        </div>
      </div>
    </div>
  )
}
