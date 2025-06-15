"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { MessageSquare, Users } from "lucide-react"

interface Stats {
  totalMessages: number
  totalConversations: number
  activeConversations: number
  lastMessageTime: string | null
}

export function BotpressStats() {
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalConversations: 0,
    activeConversations: 0,
    lastMessageTime: null,
  })

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/botpress/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Actualizar cada 10 segundos
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="p-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-sm font-medium">{stats.totalMessages}</p>
            <p className="text-xs text-gray-600">Mensajes</p>
          </div>
        </div>
      </Card>
      <Card className="p-3">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-green-500" />
          <div>
            <p className="text-sm font-medium">{stats.totalConversations}</p>
            <p className="text-xs text-gray-600">Conversaciones</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
