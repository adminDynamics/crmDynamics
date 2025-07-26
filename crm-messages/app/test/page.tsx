import { WebSocketTest } from "@/components/websocket-test"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Prueba de WebSocket</h1>
        <WebSocketTest />
      </div>
    </div>
  )
}
