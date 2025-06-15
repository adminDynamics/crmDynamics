"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare } from "lucide-react"
import { ChatView } from "./components/chat-view"
import { AgentManagement } from "./components/agent-management"
import { TwilioConfig } from "./components/twilio-config"
import { BotpressMessages } from "./components/botpress-messages"
import { MessageButton } from "@/components/MessageButton"

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

const initialAgents: Agent[] = [
  { id: "1", name: "Ana García", status: "online", activeChats: 3, maxChats: 8 },
  { id: "2", name: "Carlos López", status: "online", activeChats: 5, maxChats: 10 },
  { id: "3", name: "María Rodríguez", status: "busy", activeChats: 8, maxChats: 8 },
  { id: "4", name: "Juan Pérez", status: "offline", activeChats: 0, maxChats: 6 },
]

// Eliminar todas las conversaciones de ejemplo
const initialContacts: WhatsAppContact[] = []

export default function WhatsAppCRM() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  // Cambiar el estado inicial para que no haya conversaciones
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null)
  const [activeTab, setActiveTab] = useState("conversations")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-red-500"
      case "assigned":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50"
      case "medium":
        return "border-yellow-500 bg-yellow-50"
      case "low":
        return "border-green-500 bg-green-50"
      default:
        return "border-gray-500 bg-gray-50"
    }
  }

  const assignToAgent = (contactId: string, agentId: string) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId ? { ...contact, status: "assigned" as const, assignedAgent: agentId } : contact,
      ),
    )

    setAgents((prev) =>
      prev.map((agent) => (agent.id === agentId ? { ...agent, activeChats: agent.activeChats + 1 } : agent)),
    )
  }

  const autoAssignToAvailableAgent = (contactId: string) => {
    const availableAgent = agents.find((agent) => agent.status === "online" && agent.activeChats < agent.maxChats)

    if (availableAgent) {
      assignToAgent(contactId, availableAgent.id)
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    if (filterStatus === "all") return true
    return contact.status === filterStatus
  })

  const stats = {
    total: contacts.length,
    unread: contacts.filter((c) => c.status === "unread").length,
    assigned: contacts.filter((c) => c.status === "assigned").length,
    resolved: contacts.filter((c) => c.status === "resolved").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold">WhatsApp CRM</h1>
              <p className="text-sm text-gray-600">Gestión multiagente de conversaciones</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              API Conectada
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-80 border-r bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3 m-4">
              <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
              <TabsTrigger value="agents">Agentes</TabsTrigger>
              <TabsTrigger value="config">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="px-4 pb-4 h-full">
              <div className="space-y-4">
                <MessageButton />
                <BotpressMessages />
              </div>
            </TabsContent>

            <TabsContent value="agents" className="px-4 pb-4">
              <AgentManagement agents={agents} setAgents={setAgents} />
            </TabsContent>

            <TabsContent value="config" className="px-4 pb-4">
              <TwilioConfig />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1">
          {selectedContact ? (
            <ChatView
              contact={selectedContact}
              agents={agents}
              onAssignAgent={assignToAgent}
              onUpdateContact={(updatedContact) => {
                setContacts((prev) => prev.map((c) => (c.id === updatedContact.id ? updatedContact : c)))
                setSelectedContact(updatedContact)
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-600">Elige una conversación de WhatsApp para comenzar a gestionar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
