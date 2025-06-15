"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw, Send, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error" | "idle">("idle")
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState("Hola! Este es un mensaje de prueba desde el CRM.")
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  const checkConnection = async () => {
    setConnectionStatus("checking")
    setSendResult(null)

    try {
      const response = await fetch("/api/whatsapp/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountSid: "AC51c826d5c1c354576b17aa36806014b7",
          authToken: "5ea7bd2ff92be3ef92981b63a3f01d00",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConnectionStatus("connected")
        setLastCheck(new Date().toLocaleTimeString())
        console.log("Conexión exitosa:", data)
      } else {
        setConnectionStatus("error")
        setLastCheck(new Date().toLocaleTimeString())
      }
    } catch (error) {
      setConnectionStatus("error")
      setLastCheck(new Date().toLocaleTimeString())
      console.error("Error checking connection:", error)
    }
  }

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) return

    setIsSending(true)
    setSendResult(null)

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testPhone,
          message: testMessage,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSendResult(`✅ Mensaje enviado exitosamente! SID: ${result.messageSid}`)
      } else {
        let errorMsg = `❌ Error: ${result.error || "No se pudo enviar el mensaje"}`
        if (result.troubleshooting) {
          errorMsg += `\n💡 Sugerencia: ${result.troubleshooting.suggestion}`
        }
        setSendResult(errorMsg)
      }
    } catch (error) {
      setSendResult(`❌ Error de conexión: ${error}`)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    // Verificar conexión al cargar el componente
    checkConnection()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Estado de Conexión Twilio</span>
            <div className="flex items-center space-x-2">
              {connectionStatus === "connected" && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Conectado
                </Badge>
              )}
              {connectionStatus === "error" && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              )}
              {connectionStatus === "checking" && (
                <Badge variant="outline">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Verificando...
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={checkConnection} disabled={connectionStatus === "checking"}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Account SID:</span>
              <span className="font-mono">AC51c826...014b7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">WhatsApp Number:</span>
              <span className="font-mono">+14155238886 (Sandbox)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última verificación:</span>
              <span>{lastCheck || "Nunca"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerta importante sobre el Sandbox */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Importante:</strong> Estás usando el Sandbox de Twilio WhatsApp. Los números de destino deben estar
          registrados primero.
          <div className="mt-2">
            <a
              href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
            >
              Registrar números en Sandbox <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensaje de Prueba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testPhone">Número de destino (registrado en Sandbox)</Label>
            <Input
              id="testPhone"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+1234567890"
              type="tel"
            />
            <p className="text-xs text-gray-600 mt-1">
              Formato: +[código país][número]. Ej: +34612345678
              <br />
              <strong>Debe estar registrado en el Sandbox de Twilio</strong>
            </p>
          </div>

          <div>
            <Label htmlFor="testMessage">Mensaje</Label>
            <Input
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Mensaje de prueba"
            />
          </div>

          <Button
            onClick={sendTestMessage}
            disabled={!testPhone || !testMessage || isSending || connectionStatus !== "connected"}
            className="w-full"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensaje de Prueba
              </>
            )}
          </Button>

          {sendResult && (
            <Alert className={sendResult.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={sendResult.includes("✅") ? "text-green-800" : "text-red-800"}>
                <pre className="whitespace-pre-wrap text-sm">{sendResult}</pre>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Pasos para registrar un número en el Sandbox:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>
                  Ve al{" "}
                  <a
                    href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Sandbox de WhatsApp
                  </a>
                </li>
                <li>Envía el código de activación desde tu WhatsApp al número +1 415 523 8886</li>
                <li>Una vez activado, podrás recibir mensajes de prueba</li>
                <li>El formato del mensaje es: "join [código]" (ej: "join shadow-dog")</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label>URL del Webhook</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/api/whatsapp/webhook`
                      : "https://tu-dominio.com/api/whatsapp/webhook"
                  }
                  readOnly
                  className="bg-gray-50 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url =
                      typeof window !== "undefined"
                        ? `${window.location.origin}/api/whatsapp/webhook`
                        : "https://tu-dominio.com/api/whatsapp/webhook"
                    navigator.clipboard.writeText(url)
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Pasos para configurar en Twilio:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>
                    Ve a{" "}
                    <a
                      href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn"
                      target="_blank"
                      className="text-blue-600 underline"
                      rel="noreferrer"
                    >
                      Twilio WhatsApp Sandbox
                    </a>
                  </li>
                  <li>En "Sandbox Configuration", pega la URL del webhook</li>
                  <li>Selecciona HTTP POST como método</li>
                  <li>Guarda la configuración</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
