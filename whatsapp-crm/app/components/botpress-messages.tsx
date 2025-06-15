"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RefreshCw, MessageSquare, User, Clock, Hash } from "lucide-react"

interface BotpressMessage {
  id: string
  conversationId: string
  userId: string
  userName: string
  telegramId?: number
  messageText: string
  messageType: string
  timestamp: string
  channel: string
  direction: "incoming" | "outgoing"
  metadata: {
    telegramId?: number
    originalPayload?: any
    [key: string]: any
  }
}

export function BotpressMessages() {
  const [messages, setMessages] = useState<BotpressMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/botpress/messages/all")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setLastUpdate(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    // Actualizar cada 5 segundos
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Mensajes de Botpress</span>
              <Badge variant="outline">{messages.length}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              {lastUpdate && (
                <span className="text-sm text-gray-500">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {lastUpdate}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={fetchMessages} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay mensajes recibidos</p>
              <p className="text-sm text-gray-500">Los mensajes de Botpress aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((message) => (
                  <Card key={message.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getInitials(message.userName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-semibold text-gray-900">{message.userName}</h4>
                              <Badge variant="secondary" className="text-xs">
                                <User className="h-3 w-3 mr-1" />
                                {message.telegramId}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {message.channel}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          </div>

                          <p className="text-sm text-gray-800 mb-3 bg-gray-50 p-3 rounded-lg">
                            {message.messageText || "Sin texto"}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Hash className="h-3 w-3" />
                              <span>Conversación: {message.conversationId}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>ID: {message.id}</span>
                            </div>
                          </div>

                          {message.metadata.originalPayload && (
                            <details className="mt-3">
                              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                Ver payload original
                              </summary>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                                {JSON.stringify(message.metadata.originalPayload, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
