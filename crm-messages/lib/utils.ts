import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { MessageFormat } from "@/types/messages"

export { type MessageFormat }

export function detectMessageFormat(mensaje: string): MessageFormat {
  if (!mensaje.startsWith('http')) {
    return 'texto'
  }

  if (mensaje.includes('.oga')) {
    return 'audio'
  }

  if (mensaje.match(/\.(jpg|jpeg|png|webp|gif|svg)/i)) {
    return 'imagen'
  }

  if (mensaje.match(/\.(pdf|docx?|xlsx?|pptx?|txt|rtf)/i)) {
    return 'documento'
  }

  return 'archivo'
}

// Función para generar UUIDs compatibles con todos los navegadores
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback para navegadores que no soportan crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Función para generar IDs temporales únicos
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
