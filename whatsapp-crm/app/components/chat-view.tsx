"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Send, Phone, Video, MoreVertical, User, Clock, CheckCircle } from "lucide-react"

interface Agent {
  id: string
  name: string
  status: "online" | "busy" | "offline"
  avatar?: string
  activeChats: number
  maxChats: number
}

interface WhatsAppContact {
  id: string
  name: string
  phone: string
  avatar?: string
  lastMessage: string
  timestamp: string
  status: "unread" | "assigned" | "resolved"
  assignedAgent?: string
  priority: "high" | "medium" | "low"
}

interface Message {
  id: string
  text: string
  timestamp: string
  sender: "customer" | "agent"
  agentName?: string
  status?: "sent" | "delivered" | "read"
}

interface ChatViewProps {
  contact: WhatsAppContact
  agents: Agent[]
  onAssignAgent: (contactId: string, agentId: string) => void
  onUpdateContact: (contact: WhatsAppContact) => void
}

const sampleMessages: Message[] = [
  {
    id: "1",
    text: "Hola, necesito ayuda con mi pedido urgente",
    timestamp: "10:30",
    sender: "customer",
  },
  {
    id: "2",
    text: "Hola! Por supuesto, te ayudo con tu pedido. ¿Podrías proporcionarme tu número de pedido?",
    timestamp: "10:32",
    sender: "agent",
    agentName: "Ana García",
    status: "read",
  },
  {
    id: "3",
    text: "Sí, es el pedido #12345. Lo hice ayer pero no he recibido confirmación",
    timestamp: "10:33",
    sender: "customer",
  },
  {
    id: "4",
    text: "Perfecto, déjame revisar el estado de tu pedido #12345...",
    timestamp: "10:34",
    sender: "agent",
    agentName: "Ana García",
    status: "delivered",
  },
]

export function ChatView({ contact, agents, onAssignAgent, onUpdateContact }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [newMessage, setNewMessage] = useState("")
  const [selectedAgent, setSelectedAgent] = useState(contact.assignedAgent || "")

  const assignedAgent = agents.find((agent) => agent.id === contact.assignedAgent)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      sender: "agent",
      agentName: assignedAgent?.name || "Agente",
      status: "sent",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simular envío a WhatsApp API
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)
  }

  const handleAssignAgent = (agentId: string) => {
    onAssignAgent(contact.id, agentId)
    setSelectedAgent(agentId)
  }

  const handleResolveConversation = () => {
    const updatedContact = { ...contact, status: "resolved" as const }
    onUpdateContact(updatedContact)
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sent":
        return <Clock className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCircle className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCircle className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={contact.avatar || "/placeholder.svg"} />
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{contact.name}</h2>
              <p className="text-sm text-gray-600">{contact.phone}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={
                    contact.priority === "high"
                      ? "destructive"
                      : contact.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {contact.priority === "high" ? "Alta" : contact.priority === "medium" ? "Media" : "Baja"}
                </Badge>
                <Badge variant={contact.status === "resolved" ? "default" : "outline"}>
                  {contact.status === "unread" ? "Sin leer" : contact.status === "assigned" ? "Asignada" : "Resuelta"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Agent Assignment */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex-1">
            <Select value={selectedAgent} onValueChange={handleAssignAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Asignar agente" />
              </SelectTrigger>
              <SelectContent>
                {agents
                  .filter((agent) => agent.status !== "offline")
                  .map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${agent.status === "online" ? "bg-green-500" : "bg-yellow-500"}`}
                        ></div>
                        <span>{agent.name}</span>
                        <span className="text-xs text-gray-500">
                          ({agent.activeChats}/{agent.maxChats})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {contact.status !== "resolved" && (
            <Button variant="outline" onClick={handleResolveConversation}>
              Marcar como resuelta
            </Button>
          )}
        </div>

        {assignedAgent && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Asignado a: {assignedAgent.name}</span>
            <div
              className={`w-2 h-2 rounded-full ${assignedAgent.status === "online" ? "bg-green-500" : "bg-yellow-500"}`}
            ></div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "agent" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === "agent" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.sender === "agent" && message.agentName && (
                <p className="text-xs opacity-75 mb-1">{message.agentName}</p>
              )}
              <p className="text-sm">{message.text}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-75">{message.timestamp}</span>
                {message.sender === "agent" && getStatusIcon(message.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Presiona Enter para enviar, Shift+Enter para nueva línea</p>
      </div>
    </div>
  )
}
