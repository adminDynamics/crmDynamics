import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY no configurada" }, { status: 500 })
    }

    const body = await req.json()
    const { messages, language = "es-AR" } = body as {
      messages: Array<{
        role?: string
        content: string
        timestamp?: string
        author?: string
      }>
      language?: string
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Sin mensajes para resumir" }, { status: 400 })
    }

    const transcript = messages
      .map((m) => {
        const author = m.author || m.role || "desconocido"
        const ts = m.timestamp ? ` [${m.timestamp}]` : ""
        return `[${author}]${ts}: ${m.content}`
      })
      .join("\n")

    const systemPrompt = `Sos un asistente que resume conversaciones de soporte en español (${language}).
- Generá un resumen breve y claro, en bullets.
- Incluí: objetivo del cliente, acciones tomadas, bloqueos/preguntas abiertas, próximos pasos recomendados.
- Mantené nombres/IDs relevantes si se mencionan.
- Máximo ~150-200 palabras.`

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Conversación:\n\n${transcript}` },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const summary = data?.choices?.[0]?.message?.content ?? ""
    return NextResponse.json({ summary })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error interno" }, { status: 500 })
  }
}


