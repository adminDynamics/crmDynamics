# Implementación de Múltiples Formatos de Mensajes

## Resumen

Se ha implementado un sistema completo para manejar múltiples formatos de mensajes en el CRM de mensajes. El sistema ahora soporta texto, audio, imágenes, documentos y archivos.

## Cambios Realizados

### 1. Base de Datos (Supabase)
- Se agregó el campo `formato` a la tabla `messages`
- Tipos de formato: `texto`, `audio`, `imagen`, `documento`, `archivo`

### 2. Backend
- Se modificó el endpoint `recibirMensaje` para detectar automáticamente el formato
- Lógica de detección:
  ```typescript
  let formato = 'texto'
  if (mensaje.startsWith('http') && mensaje.includes('.oga')) formato = 'audio'
  else if (mensaje.startsWith('http') && mensaje.match(/\.(jpg|jpeg|png|webp)/i)) formato = 'imagen'
  else if (mensaje.startsWith('http') && mensaje.match(/\.(pdf|docx?|xlsx?|pptx?)/i)) formato = 'documento'
  else if (mensaje.startsWith('http')) formato = 'archivo'
  ```

### 3. Frontend

#### Tipos TypeScript
- Se creó `types/messages.ts` para centralizar las definiciones de tipos
- Tipos definidos: `MessageFormat`, `MessageType`, `Message`, `Conversation`, `SupabaseMessage`

#### Componentes
- **MessageContent**: Nuevo componente para renderizar diferentes tipos de contenido
- **Badge**: Indicador visual del tipo de formato (solo para formatos no-texto)

#### Hook use-socket
- Se actualizó para manejar el campo `formato`
- Detección automática de formato cuando no se proporciona
- Conversión de mensajes históricos con formato

#### Utilidades
- `detectMessageFormat()`: Función para detectar automáticamente el formato basado en la URL

## Formatos Soportados

### 1. Texto
- **Descripción**: Mensajes de texto plano
- **Renderizado**: Texto normal con saltos de línea preservados
- **Badge**: No se muestra (para evitar saturar la interfaz)

### 2. Audio
- **Extensiones**: .oga, .mp3, .wav
- **Renderizado**: 
  - Reproductor de audio nativo del navegador
  - Botón de descarga
- **Badge**: Icono de play + "Audio"

### 3. Imagen
- **Extensiones**: .jpg, .jpeg, .png, .webp, .gif, .svg
- **Renderizado**:
  - Imagen con hover effect
  - Click para abrir en nueva pestaña
  - Fallback si la imagen no carga
- **Badge**: Icono de imagen + "Imagen"

### 4. Documento
- **Extensiones**: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .rtf
- **Renderizado**:
  - URL del documento
  - Botón de descarga
- **Badge**: Icono de documento + "Documento"

### 5. Archivo
- **Descripción**: Cualquier otro tipo de archivo
- **Renderizado**:
  - URL del archivo
  - Botón de descarga
- **Badge**: Icono de archivo + "Archivo"

## Página de Prueba

Se creó `/test-formats` para probar todos los formatos:
- Muestra ejemplos de cada tipo de formato
- Incluye información sobre los formatos soportados
- Útil para desarrollo y testing

## Uso

### En el Chat
Los mensajes se renderizan automáticamente según su formato. No se requiere configuración adicional.

### Detección Automática
El sistema detecta automáticamente el formato basado en la URL del mensaje. Si el backend no proporciona un formato, el frontend lo detecta.

### WebSocket
Los mensajes nuevos incluyen el campo `formato` que se emite por WebSocket y se procesa automáticamente.

## Archivos Modificados

1. `types/messages.ts` - Nuevo archivo de tipos
2. `hooks/use-socket.ts` - Actualizado para manejar formato
3. `components/message-content.tsx` - Nuevo componente
4. `components/chat-panel.tsx` - Actualizado para usar MessageContent
5. `lib/supabase.ts` - Actualizado para usar tipos centralizados
6. `lib/utils.ts` - Agregada función de detección de formato
7. `app/test-formats/page.tsx` - Nueva página de prueba

## Compatibilidad

- ✅ Mensajes existentes se muestran como texto por defecto
- ✅ Detección automática de formato para mensajes nuevos
- ✅ Fallback graceful para URLs no válidas
- ✅ Manejo de errores para imágenes que no cargan 