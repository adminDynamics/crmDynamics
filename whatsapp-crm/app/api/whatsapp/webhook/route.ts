import { type NextRequest, NextResponse } from "next/server"
import { cleanPhoneFromTwilio } from "@/lib/twilio-config"
import { saveIncomingMessage } from "@/lib/message-service"

// Webhook para recibir mensajes de Twilio (WhatsApp o SMS)
export async function POST(request: NextRequest) {
  try {
    // Obtener la URL completa para validación de webhook
    const url = request.url

    // Obtener la firma de Twilio del encabezado
    const twilioSignature = request.headers.get("X-Twilio-Signature") || ""

    // Obtener los datos del formulario
    const formData = await request.formData()
    const params: Record<string, string> = {}

    // Convertir FormData a objeto para validación
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    // Validar que el webhook viene realmente de Twilio
    // Comentado para desarrollo, descomentar en producción
    /*
    if (!validateTwilioWebhook(twilioSignature, url, params)) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }
    */

    // Extraer datos del webhook de Twilio
    const messageType = formData.get("MessageType") || formData.get("SmsMessageSid") ? "SMS" : "WhatsApp"
    const message = formData.get("Body") as string
    const from = formData.get("From") as string
    const to = formData.get("To") as string
    const profileName = (formData.get("ProfileName") as string) || ""
    const messageSid = formData.get("MessageSid") as string
    const numMedia = Number.parseInt((formData.get("NumMedia") as string) || "0")

    // Extraer información de medios adjuntos (si hay)
    const mediaItems = []
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = formData.get(`MediaUrl${i}`) as string
      const contentType = formData.get(`MediaContentType${i}`) as string

      if (mediaUrl) {
        mediaItems.push({
          url: mediaUrl,
          contentType,
          index: i,
        })
      }
    }

    // Limpiar el número de teléfono (remover "whatsapp:" si existe)
    const phoneNumber = cleanPhoneFromTwilio(from)

    console.log(`Mensaje recibido de ${phoneNumber} (${profileName || "Desconocido"}): ${message}`)
    console.log(`Tipo: ${messageType}, Medios adjuntos: ${numMedia}`)

    // Crear objeto con todos los datos del mensaje
    const messageData = {
      from: phoneNumber,
      to: cleanPhoneFromTwilio(to),
      profileName: profileName || "Usuario",
      text: message,
      messageSid,
      messageType,
      media: mediaItems,
      timestamp: new Date().toISOString(),
      rawData: params, // Guardar todos los datos para referencia
    }

    // Guardar el mensaje en la base de datos
    try {
      await saveIncomingMessage(messageData)
      console.log("Mensaje guardado correctamente")
    } catch (error) {
      console.error("Error guardando mensaje:", error)
      // Continuamos el proceso aunque falle el guardado
    }

    // Emitir evento para notificar a los clientes conectados (si usas WebSockets)
    // await notifyNewMessage(messageData)

    // Responder a Twilio con un TwiML vacío o con un mensaje automático
    // Para responder con un mensaje automático:
    /*
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Gracias por tu mensaje. Un agente te responderá pronto.</Message>
      </Response>`,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    )
    */

    // Para responder sin mensaje automático:
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Verificación del webhook (opcional, para configuración inicial)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "Twilio webhook endpoint active",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
