"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ConversationsList } from "@/components/conversations-list"
import { ChatPanel } from "@/components/chat-panel"
import { useSocket } from "@/hooks/use-socket"

export default function CRMPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const { isConnected, connectionError } = useSocket()

  // Estado para login
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Usuarios por defecto
  const users = [
    { username: "admin", password: "Admin" },
    { username: "user1", password: "123" },
  ]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    const user = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    )
    if (user) {
      setIsLoggedIn(true)
    } else {
      setLoginError("Usuario o contraseña incorrectos")
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-xs">
          <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nombre de usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoComplete="current-password"
            />
          </div>
          {loginError && <div className="mb-4 text-red-600 text-sm text-center">{loginError}</div>}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
          {connectionError ? `Error: ${connectionError}` : "Conectando..."}
        </div>
      )}

      <div className={`flex w-full ${!isConnected ? "mt-10" : ""}`}>
        <Sidebar />
        <ConversationsList selectedConversation={selectedConversation} onSelectConversation={setSelectedConversation} />
        <ChatPanel conversationId={selectedConversation} onBack={() => setSelectedConversation(null)} />
      </div>
    </div>
  )
}
