import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken } = await request.json()

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: "Account SID y Auth Token son requeridos" }, { status: 400 })
    }

    // Probar conexión con Twilio obteniendo información de la cuenta
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`

    const response = await fetch(twilioUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
    })

    if (response.ok) {
      const accountInfo = await response.json()
      return NextResponse.json({
        success: true,
        accountInfo: {
          friendlyName: accountInfo.friendly_name,
          status: accountInfo.status,
          type: accountInfo.type,
        },
      })
    } else {
      const error = await response.json()
      return NextResponse.json({ error: "Credenciales inválidas", details: error }, { status: 401 })
    }
  } catch (error) {
    console.error("Error testing Twilio connection:", error)
    return NextResponse.json({ error: "Error al probar conexión" }, { status: 500 })
  }
}
