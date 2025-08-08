"use client"

import { Play, Download, FileText, Image, File, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MessageContentProps } from "@/types/messages"
import { AudioPlayer } from "@/components/audio-player"

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
            {isUrl ? (
              <AudioPlayer 
                src={mensaje} 
                filename={mensaje.split('/').pop() || 'audio'} 
              />
            ) : (
              <p className="text-sm text-gray-500 italic">URL de audio no válida</p>
            )}
          </div>
        )

      case "imagen":
        return (
          <div className="space-y-2">
            {isUrl ? (
              <div className="relative group">
                <img
                  src={mensaje}
                  alt="Imagen del mensaje"
                  className="max-w-full h-auto rounded-lg border cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => window.open(mensaje, '_blank')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                {/* Overlay con botones al hacer hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(mensaje, '_blank')}
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      <Image className="w-4 h-4 mr-1" />
                      Ampliar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = mensaje
                        link.download = mensaje.split('/').pop() || 'imagen'
                        link.click()
                      }}
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
                {/* Fallback si la imagen no carga */}
                <div className="hidden absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Error al cargar imagen</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(mensaje, '_blank')}
                      >
                        <Image className="w-4 h-4 mr-1" />
                        Ver imagen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = mensaje
                          link.download = mensaje.split('/').pop() || 'imagen'
                          link.click()
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
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
            {isUrl ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Documento</p>
                  <p className="text-xs text-gray-500 truncate">{mensaje.split('/').pop() || 'documento'}</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(mensaje, '_blank')}
                    className="w-10 h-10 p-0"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = mensaje
                      link.download = mensaje.split('/').pop() || 'documento'
                      link.click()
                    }}
                    className="w-10 h-10 p-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">URL de documento no válida</p>
            )}
          </div>
        )

      case "archivo":
        return (
          <div className="space-y-2">
            {isUrl ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <File className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Archivo</p>
                  <p className="text-xs text-gray-500 truncate">{mensaje.split('/').pop() || 'archivo'}</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(mensaje, '_blank')}
                    className="w-10 h-10 p-0"
                  >
                    <File className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = mensaje
                      link.download = mensaje.split('/').pop() || 'archivo'
                      link.click()
                    }}
                    className="w-10 h-10 p-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
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