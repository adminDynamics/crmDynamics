import { type NextRequest, NextResponse } from "next/server"
import { TWILIO_CONFIG, formatPhoneForTwilio, formatFromNumberForTwilio } from "@/lib/twilio-config"

// Endpoint para probar la configuración de Twilio
export async function POST(request: NextRequest) {
  try {
    const { to, message = "Este es un mensaje de prueba desde el CRM." } = await request.json()

    if (!to) {
      return NextResponse.json({ error: "Se requiere un número de destino" }, { status: 400 })
    }

    // Verificar configuración
    if (!TWILIO_CONFIG.ACCOUNT_SID || !TWILIO_CONFIG.AUTH_TOKEN || !TWILIO_CONFIG.PHONE_NUMBER) {
      return NextResponse.json(
        {
          error: "Configuración incompleta",
          missing: [
            !TWILIO_CONFIG.ACCOUNT_SID ? "TWILIO_ACCOUNT_SID" : null,
            !TWILIO_CONFIG.AUTH_TOKEN ? "TWILIO_AUTH_TOKEN" : null,
            !TWILIO_CONFIG.PHONE_NUMBER ? "TWILIO_PHONE_NUMBER" : null,
          ].filter(Boolean),
        },
        { status: 400 },
      )
    }

    // Formatear números
    const formattedTo = formatPhoneForTwilio(to)
    const formattedFrom = formatFromNumberForTwilio(TWILIO_CONFIG.PHONE_NUMBER)

    // Preparar datos para Twilio
    const twilioData = new URLSearchParams({
      From: formattedFrom,
      To: formattedTo,
      Body: message,
    })

    // Llamada a la API de Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.ACCOUNT_SID}/Messages.json`

    console.log("Enviando mensaje de prueba:", {
      from: formattedFrom,
      to: formattedTo,
      url: twilioUrl,
    })

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${TWILIO_CONFIG.ACCOUNT_SID}:${TWILIO_CONFIG.AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioData.toString(),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Error de Twilio:", result)
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Error desconocido",
          code: result.code,
          moreInfo: result.more_info,
          details: result,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      messageSid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      dateCreated: result.date_created,
      message: "Mensaje de prueba enviado correctamente",
    })
  } catch (error) {
    console.error("Error en prueba de Twilio:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
