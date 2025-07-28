"use client"

import { Play, Download, FileText, Image, File, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MessageContentProps } from "@/types/messages"

export function MessageContent({ mensaje, formato }: MessageContentProps) {
  const isUrl = mensaje.startsWith('http')

  const renderContent = () => {
    switch (formato) {
      case "texto":
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {mensaje || "Mensaje vacío"}
          </p>
        )

      case "audio":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <Play className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Audio</span>
            </div>
            {isUrl ? (
              <div className="space-y-2">
                <audio controls className="w-full">
                  <source src={mensaje} type="audio/ogg" />
                  <source src={mensaje} type="audio/mpeg" />
                  <source src={mensaje} type="audio/wav" />
                  Tu navegador no soporta el elemento de audio.
                </audio>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(mensaje, '_blank')}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Audio
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">URL de audio no válida</p>
            )}
          </div>
        )

      case "imagen":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <Image className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Imagen</span>
            </div>
            {isUrl ? (
              <div className="relative">
                <img
                  src={mensaje}
                  alt="Imagen del mensaje"
                  className="max-w-full h-auto rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(mensaje, '_blank')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="hidden absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Error al cargar imagen</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(mensaje, '_blank')}
                      className="mt-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Ver imagen
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">URL de imagen no válida</p>
            )}
          </div>
        )

      case "documento":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Documento</span>
            </div>
            {isUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 break-all">{mensaje}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(mensaje, '_blank')}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Documento
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">URL de documento no válida</p>
            )}
          </div>
        )

      case "archivo":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <File className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Archivo</span>
            </div>
            {isUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 break-all">{mensaje}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(mensaje, '_blank')}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Archivo
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">URL de archivo no válida</p>
            )}
          </div>
        )

      default:
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {mensaje || "Mensaje vacío"}
          </p>
        )
    }
  }

  const getFormatIcon = () => {
    switch (formato) {
      case "texto": return <Type className="w-3 h-3" />
      case "audio": return <Play className="w-3 h-3" />
      case "imagen": return <Image className="w-3 h-3" />
      case "documento": return <FileText className="w-3 h-3" />
      case "archivo": return <File className="w-3 h-3" />
      default: return <Type className="w-3 h-3" />
    }
  }

  const getFormatLabel = () => {
    switch (formato) {
      case "texto": return "Texto"
      case "audio": return "Audio"
      case "imagen": return "Imagen"
      case "documento": return "Documento"
      case "archivo": return "Archivo"
      default: return "Texto"
    }
  }

  return (
    <div className="w-full space-y-2">
      {formato !== "texto" && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {getFormatIcon()}
            <span className="ml-1">{getFormatLabel()}</span>
          </Badge>
        </div>
      )}
      {renderContent()}
    </div>
  )
} 