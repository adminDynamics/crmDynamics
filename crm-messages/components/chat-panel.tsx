"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, ArrowLeft, Hash, Phone, Video, MoreHorizontal, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSocket } from "@/hooks/use-socket"
import { MessageContent } from "@/components/message-content"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ChatPanelProps {
  conversationId: string | null
  onBack?: () => void
}

export function ChatPanel({ conversationId, onBack }: ChatPanelProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { getConversation, sendTelegramMessage, isConnected, conversations, messages } = useSocket()

  const conversation = conversationId ? getConversation(conversationId) : null

  console.log("🔍 Debug ChatPanel:", {
    conversationId,
    conversationFound: !!conversation,
    conversationData: conversation
      ? {
          id: conversation.conversationId,
          userId: conversation.userId,
          messagesCount: conversation.messages?.length || 0,
        }
      : null,
    totalConversations: conversations.length,
    totalGlobalMessages: messages.length,
  })

  useEffect(() => {
    if (conversation?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversation?.messages])

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSummarize = async () => {
    if (!conversation) return
    setSummarizing(true)
    setSummary(null)
    try {
      const payload = conversation.messages.map((m) => ({
        author: m.tipo === "cliente" ? "cliente" : "agente",
        content: m.mensaje,
        timestamp: m.timestamp.toISOString(),
      }))

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload, language: "es-AR" }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error generando resumen")
      }

      const data = await res.json()
      setSummary(data.summary || "")
    } catch (e) {
      setSummary("No se pudo generar el resumen.")
    } finally {
      setSummarizing(false)
    }
  }

  const handleSend = async () => {
    if (!message.trim() || !conversation || sending) return

    setSending(true)

    try {
      const chatId = conversation.chatId

      if (!chatId) {
        alert("No se encontró chatId para esta conversación")
        setSending(false)
        return
      }

      const result = await sendTelegramMessage(chatId, message, conversation.conversationId, conversation.userId)

      if (result.success) {
        setMessage("")
      } else {
        alert("Error: " + result.error)
      }
    } catch (error) {
      alert("Error al enviar mensaje")
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Sin conversación seleccionada
  if (!conversationId) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Hash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Selecciona una conversación</h3>
          <p className="text-gray-500">Elige una conversación de la lista para comenzar</p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Total conversaciones: {conversations.length}</p>
            <p>Total mensajes: {messages.length}</p>
          </div>
        </div>
      </div>
    )
  }

  // Conversación no encontrada
  if (!conversation) {
    return (
      <div className="flex-1 bg-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">Conversación no encontrada</h3>
          <p className="text-yellow-700 mb-4">Buscando: {conversationId}</p>

          <div className="bg-white p-4 rounded border text-left text-sm">
            <p className="font-medium mb-2">Debug Info:</p>
            <p>Total conversaciones: {conversations.length}</p>
            <p>Total mensajes globales: {messages.length}</p>
            <div className="mt-2">
              <p className="font-medium">IDs disponibles:</p>
              {conversations.length === 0 ? (
                <p className="text-gray-500 italic">No hay conversaciones</p>
              ) : (
                <ul className="text-xs font-mono mt-1 space-y-1">
                  {conversations.map((conv) => (
                    <li key={conv.conversationId} className="bg-gray-100 p-1 rounded">
                      {conv.conversationId} ({conv.messages.length} msgs)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-purple-100 text-purple-600">
                {conversation.userId.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold">{conversation.userId}</h3>
              <p className="text-sm text-gray-500">
                {conversation.messages.length} mensajes • ID: {conversation.conversationId.slice(-8)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" title="Resumir conversación">
                  <Brain className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resumen con IA</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Button onClick={handleSummarize} disabled={summarizing || !conversation} className="bg-purple-600 hover:bg-purple-700">
                    {summarizing ? "Resumiendo..." : "Generar resumen"}
                  </Button>
                  <div className="text-sm whitespace-pre-wrap max-h-80 overflow-auto border rounded p-3 bg-gray-50">
                    {summary ? summary : "Sin resumen todavía."}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-4">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay mensajes en esta conversación</p>
              <p className="text-xs mt-2">Los mensajes aparecerán aquí cuando lleguen</p>
            </div>
          ) : (
            <>
              {console.log("🔍 Debug - Mensajes en conversación:", {
                conversationId: conversation.conversationId,
                userId: conversation.userId,
                totalMessages: conversation.messages.length,
                messages: conversation.messages.map((m) => ({
                  id: m.id,
                  mensaje: m.mensaje,
                  tipo: m.tipo,
                  formato: m.formato,
                  timestamp: m.timestamp,
                })),
              })}
              {conversation.messages.map((msg, index) => {
                console.log("🔍 Renderizando mensaje:", {
                  id: msg.id,
                  mensaje: msg.mensaje,
                  tipo: msg.tipo,
                  formato: msg.formato,
                  timestamp: msg.timestamp,
                })
                return (
                  <div key={msg.id} className={`flex ${msg.tipo === "cliente" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                        msg.tipo === "cliente"
                          ? "bg-white border border-gray-200 text-gray-900"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      <MessageContent mensaje={msg.mensaje} formato={msg.formato} />
                      <div
                        className={`flex items-center justify-between mt-2 text-xs ${
                          msg.tipo === "cliente" ? "text-gray-500" : "text-purple-200"
                        }`}
                      >
                        <span className="font-medium">{msg.tipo === "cliente" ? "Cliente" : "Agente"}</span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={sending || !isConnected}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending || !isConnected}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {!isConnected && "❌ Desconectado"}
          {sending && "📤 Enviando..."}
          {isConnected && !sending && "✅ Listo para enviar"}
        </div>
      </div>
    </div>
  )
}
