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
