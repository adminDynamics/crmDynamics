"use client"

import { MessageContent } from "@/components/message-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const testMessages = [
  {
    mensaje: "Hola, este es un mensaje de texto normal",
    formato: "texto" as const,
    descripcion: "Mensaje de texto plano"
  },
  {
    mensaje: "https://example.com/audio.oga",
    formato: "audio" as const,
    descripcion: "Archivo de audio OGA"
  },
  {
    mensaje: "https://example.com/image.jpg",
    formato: "imagen" as const,
    descripcion: "Imagen JPG"
  },
  {
    mensaje: "https://example.com/document.pdf",
    formato: "documento" as const,
    descripcion: "Documento PDF"
  },
  {
    mensaje: "https://example.com/file.zip",
    formato: "archivo" as const,
    descripcion: "Archivo ZIP"
  },
  {
    mensaje: "https://picsum.photos/400/300",
    formato: "imagen" as const,
    descripcion: "Imagen real de prueba"
  }
]

export default function TestFormatsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Prueba de Formatos de Mensajes</h1>
      
      <div className="grid gap-6">
        {testMessages.map((test, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{test.descripcion}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <MessageContent 
                  mensaje={test.mensaje} 
                  formato={test.formato} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Información de Formatos</h2>
        <ul className="space-y-2 text-sm">
          <li><strong>Texto:</strong> Mensajes de texto plano</li>
          <li><strong>Audio:</strong> Archivos .oga, .mp3, .wav</li>
          <li><strong>Imagen:</strong> Archivos .jpg, .jpeg, .png, .webp, .gif, .svg</li>
          <li><strong>Documento:</strong> Archivos .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .rtf</li>
          <li><strong>Archivo:</strong> Cualquier otro tipo de archivo</li>
        </ul>
      </div>
    </div>
  )
} 