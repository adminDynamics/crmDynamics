import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://qxsrtcojpttaweymaxcw.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c3J0Y29qcHR0YXdleW1heGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM2NzI1NiwiZXhwIjoyMDYzOTQzMjU2fQ.BBqVN_lMnPsroQ-swVz6NjkaYo7lTlW0IQGfyL1_9lA"

export const supabase = createClient(supabaseUrl, supabaseKey)

import type { SupabaseMessage } from "@/types/messages"

export { type SupabaseMessage }

export async function loadHistoricalMessages(): Promise<SupabaseMessage[]> {
  try {
    console.log("🔄 Cargando mensajes históricos desde Supabase...")

    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, message, timestamp, tipo, formato, user_id, chat_id")
      .order("timestamp", { ascending: true })

    if (error) {
      console.error("❌ Error cargando mensajes históricos:", error)
      return []
    }

    console.log(`✅ Cargados ${data?.length || 0} mensajes históricos`)
    return data || []
  } catch (error) {
    console.error("❌ Error conectando con Supabase:", error)
    return []
  }
}

export async function saveMessage(message: {
  id: string
  mensaje: string
  tipo: "cliente" | "bot"
  formato: "texto" | "audio" | "imagen" | "documento" | "archivo"
  user_id: string
  conversation_id: string
  chat_id?: string
  timestamp: string
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("messages").insert([{
      id: message.id,
      message: message.mensaje,
      tipo: message.tipo,
      formato: message.formato,
      user_id: message.user_id,
      conversation_id: message.conversation_id,
      chat_id: message.chat_id,
      timestamp: message.timestamp,
    }])

    if (error) {
      console.error("❌ Error guardando mensaje:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("❌ Error guardando en Supabase:", error)
    return false
  }
}

export async function setBotActivoTrueByTelegramId(telegram_id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("users")
      .update({ bot_activo: true })
      .eq("telegram_id", telegram_id)

    if (error) {
      console.error("❌ Error actualizando bot_activo:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("❌ Error conectando con Supabase:", error)
    return false
  }
}
