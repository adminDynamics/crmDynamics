// Configuración centralizada de Twilio para número real
export const TWILIO_CONFIG = {
  // Credenciales principales
  ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",

  // Número de teléfono real comprado en Twilio
  PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "",

  // Configuración de WhatsApp Business (si aplica)
  WHATSAPP_PHONE_NUMBER_ID: process.env.TWILIO_WHATSAPP_PHONE_NUMBER_ID || "",

  // Configuración de seguridad para webhooks
  WEBHOOK_AUTH_TOKEN: process.env.TWILIO_WEBHOOK_AUTH_TOKEN || "",

  // URLs de webhook (opcional, para referencia)
  WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL || "",

  // Modo de operación
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const

// Función para validar la configuración
export function validateTwilioConfig() {
  const missing = []

  if (!TWILIO_CONFIG.ACCOUNT_SID) missing.push("TWILIO_ACCOUNT_SID")
  if (!TWILIO_CONFIG.AUTH_TOKEN) missing.push("TWILIO_AUTH_TOKEN")
  if (!TWILIO_CONFIG.PHONE_NUMBER) missing.push("TWILIO_PHONE_NUMBER")

  return {
    isValid: missing.length === 0,
    missing,
  }
}

// Función para formatear números de teléfono para Twilio
export function formatPhoneForTwilio(phone: string): string {
  // Si ya tiene el prefijo whatsapp:, lo devolvemos tal como está
  if (phone.startsWith("whatsapp:")) {
    return phone
  }

  // Si no tiene +, lo agregamos (asumiendo que ya tiene código de país)
  if (!phone.startsWith("+")) {
    phone = "+" + phone
  }

  // Para números reales de WhatsApp Business, no necesitamos el prefijo whatsapp:
  // Solo lo agregamos si estamos usando el sandbox o si se especifica
  const useWhatsAppPrefix = process.env.TWILIO_USE_WHATSAPP_PREFIX === "true"

  return useWhatsAppPrefix ? `whatsapp:${phone}` : phone
}

// Función para formatear el número FROM para Twilio
export function formatFromNumberForTwilio(phone: string): string {
  // Para el número FROM, depende de si estamos usando WhatsApp Business o SMS
  const useWhatsAppPrefix = process.env.TWILIO_USE_WHATSAPP_PREFIX === "true"

  if (phone.startsWith("whatsapp:")) {
    return phone
  }

  if (!phone.startsWith("+")) {
    phone = "+" + phone
  }

  return useWhatsAppPrefix ? `whatsapp:${phone}` : phone
}

// Función para limpiar números de teléfono de Twilio
export function cleanPhoneFromTwilio(phone: string): string {
  return phone.replace("whatsapp:", "")
}

// Función para verificar si un webhook es auténtico de Twilio
export function validateTwilioWebhook(signature: string, url: string, params: Record<string, string>): boolean {
  // En producción, implementaríamos la validación de firma de Twilio
  // https://www.twilio.com/docs/usage/webhooks/webhooks-security

  // Ejemplo simplificado:
  if (!TWILIO_CONFIG.IS_PRODUCTION) {
    return true // En desarrollo, aceptamos todos los webhooks
  }

  // En producción, usaríamos la biblioteca de Twilio para validar
  try {
    // Aquí iría la validación real con twilio-node
    // const twilio = require('twilio');
    // const requestIsValid = twilio.validateRequest(
    //   TWILIO_CONFIG.AUTH_TOKEN,
    //   signature,
    //   url,
    //   params
    // );
    // return requestIsValid;

    return true // Placeholder
  } catch (error) {
    console.error("Error validating webhook:", error)
    return false
  }
}
