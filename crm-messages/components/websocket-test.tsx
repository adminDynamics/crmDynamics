"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSocket } from "@/hooks/use-socket"

export function WebSocketTest() {
  const [testMessage, setTestMessage] = useState("")
  const { messages, isConnected, connectionError, sendMessage, clearMessages } = useSocket()

  const handleSendTest = () => {
    if (testMessage.trim()) {
      sendMessage({
        mensaje: testMessage,
        tipo: "cliente",
        userId: "Test User",
      })
      setTestMessage("")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          WebSocket Test
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
        </CardTitle>
        {connectionError && <p className="text-sm text-red-600">Error: {connectionError}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex gap-2">
          <Input
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Mensaje de prueba..."
            onKeyPress={(e) => e.key === "Enter" && handleSendTest()}
          />
          <Button onClick={handleSendTest} disabled={!isConnected || !testMessage.trim()}>
            Enviar
          </Button>
          <Button variant="outline" onClick={clearMessages}>
            Limpiar
          </Button>
        </div>

        {/* Messages Display */}
        <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No hay mensajes</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`bg-white p-2 rounded border ${
                    msg.tipo === "cliente" ? "border-green-200" : "border-blue-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <strong
                      className={`text-sm uppercase ${msg.tipo === "cliente" ? "text-green-700" : "text-blue-700"}`}
                    >
                      {msg.tipo}:
                    </strong>
                    <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm mt-1">{msg.mensaje}</p>
                  <p className="text-xs text-gray-500 mt-1">{msg.userId}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection Info */}
        <div className="text-sm text-gray-600">
          <p>Estado: {isConnected ? "✅ Conectado" : "❌ Desconectado"}</p>
          <p>Mensajes recibidos: {messages.length}</p>
          <p>Servidor: https://crmdynamics.onrender.com</p>
        </div>
      </CardContent>
    </Card>
  )
}
