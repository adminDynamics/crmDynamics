import { type NextRequest, NextResponse } from "next/server"
import { TWILIO_CONFIG, formatPhoneForTwilio, formatFromNumberForTwilio } from "@/lib/twilio-config"
import { saveOutgoingMessage } from "@/lib/message-service"

// Envío de mensajes usando Twilio API
export async function POST(request: NextRequest) {
  try {
    const { to, message, media, messageType = "text" } = await request.json()

    // Validar datos de entrada
    if (!to || !message) {
      return NextResponse.json({ error: "Se requiere destinatario y mensaje" }, { status: 400 })
    }

    // Credenciales de Twilio desde variables de entorno
    const accountSid = TWILIO_CONFIG.ACCOUNT_SID
    const authToken = TWILIO_CONFIG.AUTH_TOKEN
    const twilioPhoneNumber = TWILIO_CONFIG.PHONE_NUMBER

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json({ error: "Credenciales de Twilio no configuradas" }, { status: 500 })
    }

    // Formatear números correctamente para Twilio
    const formattedTo = formatPhoneForTwilio(to)
    const formattedFrom = formatFromNumberForTwilio(twilioPhoneNumber)

    console.log("Enviando mensaje:", {
      from: formattedFrom,
      to: formattedTo,
      message: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
      hasMedia: !!media,
    })

    // Preparar datos para Twilio
    const twilioData = new URLSearchParams({
      From: formattedFrom,
      To: formattedTo,
      Body: message,
    })

    // Si hay medios adjuntos, agregarlos
    if (media && media.url) {
      twilioData.append("MediaUrl", media.url)
    }

    // Llamada a la API de Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioData.toString(),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Error de Twilio:", result)

      // Proporcionar mensajes de error más específicos
      let errorMessage = "Error al enviar mensaje"
      if (result.message) {
        if (result.code === 21211) {
          errorMessage = "Número de teléfono inválido"
        } else if (result.code === 21608) {
          errorMessage = "El número de teléfono no está habilitado para este tipo de mensajes"
        } else if (result.code === 21610) {
          errorMessage = "El mensaje contiene contenido no permitido"
        } else {
          errorMessage = result.message
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: result,
          code: result.code,
        },
        { status: response.status },
      )
    }

    console.log("Mensaje enviado exitosamente:", result.sid)

    // Guardar el mensaje enviado en la base de datos
    try {
      await saveOutgoingMessage({
        to: formattedTo,
        from: formattedFrom,
        text: message,
        messageSid: result.sid,
        status: result.status,
        media: media ? [media] : [],
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error guardando mensaje enviado:", error)
      // Continuamos aunque falle el guardado
    }

    return NextResponse.json({
      success: true,
      messageSid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      dateCreated: result.date_created,
      dateUpdated: result.date_updated,
    })
  } catch (error) {
    console.error("Error sending message via Twilio:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
