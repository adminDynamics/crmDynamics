import { type NextRequest, NextResponse } from "next/server"
import { TWILIO_CONFIG } from "@/lib/twilio-config"

// Endpoint para verificar el estado de la configuración de Twilio
export async function GET(request: NextRequest) {
  try {
    // Verificar configuración básica
    const configStatus = {
      accountSid: TWILIO_CONFIG.ACCOUNT_SID ? "configurado" : "falta",
      authToken: TWILIO_CONFIG.AUTH_TOKEN ? "configurado" : "falta",
      phoneNumber: TWILIO_CONFIG.PHONE_NUMBER ? "configurado" : "falta",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    }

    // Verificar conexión a Twilio (opcional)
    let twilioConnection = "no verificado"
    let phoneDetails = null

    if (configStatus.accountSid === "configurado" && configStatus.authToken === "configurado") {
      try {
        // Intentar obtener información de la cuenta
        const accountUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.ACCOUNT_SID}.json`

        const response = await fetch(accountUrl, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${TWILIO_CONFIG.ACCOUNT_SID}:${TWILIO_CONFIG.AUTH_TOKEN}`).toString("base64")}`,
          },
        })

        if (response.ok) {
          twilioConnection = "conectado"

          // Si hay un número configurado, obtener sus detalles
          if (TWILIO_CONFIG.PHONE_NUMBER) {
            try {
              const phoneUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.ACCOUNT_SID}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(TWILIO_CONFIG.PHONE_NUMBER)}`

              const phoneResponse = await fetch(phoneUrl, {
                headers: {
                  Authorization: `Basic ${Buffer.from(`${TWILIO_CONFIG.ACCOUNT_SID}:${TWILIO_CONFIG.AUTH_TOKEN}`).toString("base64")}`,
                },
              })

              if (phoneResponse.ok) {
                const phoneData = await phoneResponse.json()
                if (phoneData.incoming_phone_numbers && phoneData.incoming_phone_numbers.length > 0) {
                  const phone = phoneData.incoming_phone_numbers[0]
                  phoneDetails = {
                    sid: phone.sid,
                    number: phone.phone_number,
                    friendlyName: phone.friendly_name,
                    capabilities: phone.capabilities,
                    smsUrl: phone.sms_url,
                    smsMethod: phone.sms_method,
                    voiceUrl: phone.voice_url,
                    voiceMethod: phone.voice_method,
                  }
                }
              }
            } catch (error) {
              console.error("Error obteniendo detalles del número:", error)
            }
          }
        } else {
          twilioConnection = "error de conexión"
        }
      } catch (error) {
        twilioConnection = "error: " + (error instanceof Error ? error.message : String(error))
      }
    }

    return NextResponse.json({
      status: "ok",
      config: configStatus,
      twilioConnection,
      phoneDetails,
      webhookUrl: `${request.nextUrl.origin}/api/whatsapp/webhook`,
    })
  } catch (error) {
    console.error("Error checking status:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
