"use client"

import { useSocket } from "@/hooks/use-socket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugPanel() {
  const { conversations, activeConversationId, activeConversation, allMessages } = useSocket()

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="text-sm">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Total Messages:</strong> {allMessages.length}
        </div>
        <div>
          <strong>Total Conversations:</strong> {conversations.length}
        </div>
        <div>
          <strong>Active Conversation ID:</strong> {activeConversationId || "None"}
        </div>
        <div>
          <strong>Active Conversation Found:</strong> {activeConversation ? "Yes" : "No"}
        </div>

        <div className="mt-4">
          <strong>Conversations:</strong>
          <div className="ml-2 space-y-1">
            {conversations.map((conv) => (
              <div key={conv.id} className="text-xs">
                <code>{conv.conversationId}</code> - {conv.messages.length} msgs
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <strong>Recent Messages:</strong>
          <div className="ml-2 space-y-1">
            {allMessages.slice(-3).map((msg) => (
              <div key={msg.id} className="text-xs">
                <code>{msg.conversationId}</code>: {msg.mensaje.substring(0, 30)}...
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
