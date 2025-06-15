"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Users } from "lucide-react"

interface Agent {
  id: string
  name: string
  status: "online" | "busy" | "offline"
  avatar?: string
  activeChats: number
  maxChats: number
}

interface AgentManagementProps {
  agents: Agent[]
  setAgents: (agents: Agent[]) => void
}

export function AgentManagement({ agents, setAgents }: AgentManagementProps) {
  const [isAddingAgent, setIsAddingAgent] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [newAgent, setNewAgent] = useState({
    name: "",
    maxChats: 8,
    status: "offline" as const,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "En línea"
      case "busy":
        return "Ocupado"
      case "offline":
        return "Desconectado"
      default:
        return "Desconocido"
    }
  }

  const handleAddAgent = () => {
    if (!newAgent.name.trim()) return

    const agent: Agent = {
      id: Date.now().toString(),
      name: newAgent.name,
      status: newAgent.status,
      activeChats: 0,
      maxChats: newAgent.maxChats,
    }

    setAgents([...agents, agent])
    setNewAgent({ name: "", maxChats: 8, status: "offline" })
    setIsAddingAgent(false)
  }

  const handleUpdateAgentStatus = (agentId: string, status: Agent["status"]) => {
    setAgents(agents.map((agent) => (agent.id === agentId ? { ...agent, status } : agent)))
  }

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter((agent) => agent.id !== agentId))
  }

  const stats = {
    total: agents.length,
    online: agents.filter((a) => a.status === "online").length,
    busy: agents.filter((a) => a.status === "busy").length,
    offline: agents.filter((a) => a.status === "offline").length,
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{stats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">{stats.online}</p>
              <p className="text-xs text-gray-600">En línea</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Agent Button */}
      <Dialog open={isAddingAgent} onOpenChange={setIsAddingAgent}>
        <DialogTrigger asChild>
          <Button className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Agente
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Agente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newAgent.name}
                onChange={(e) => setNewAgent((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del agente"
              />
            </div>
            <div>
              <Label htmlFor="maxChats">Máximo de chats</Label>
              <Input
                id="maxChats"
                type="number"
                value={newAgent.maxChats}
                onChange={(e) => setNewAgent((prev) => ({ ...prev, maxChats: Number.parseInt(e.target.value) || 8 }))}
                min="1"
                max="20"
              />
            </div>
            <div>
              <Label htmlFor="status">Estado inicial</Label>
              <Select
                value={newAgent.status}
                onValueChange={(value: Agent["status"]) => setNewAgent((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">En línea</SelectItem>
                  <SelectItem value="busy">Ocupado</SelectItem>
                  <SelectItem value="offline">Desconectado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddAgent} className="flex-1">
                Agregar
              </Button>
              <Button variant="outline" onClick={() => setIsAddingAgent(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agents List */}
      <div className="space-y-2">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{agent.name}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                    <span className="text-xs text-gray-600">{getStatusText(agent.status)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {agent.activeChats}/{agent.maxChats} chats activos
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Select
                  value={agent.status}
                  onValueChange={(value: Agent["status"]) => handleUpdateAgentStatus(agent.id, value)}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">En línea</SelectItem>
                    <SelectItem value="busy">Ocupado</SelectItem>
                    <SelectItem value="offline">Desconectado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => handleDeleteAgent(agent.id)} className="h-8 w-8 p-0">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay agentes configurados</p>
          <p className="text-sm text-gray-500">Agrega tu primer agente para comenzar</p>
        </div>
      )}
    </div>
  )
}
