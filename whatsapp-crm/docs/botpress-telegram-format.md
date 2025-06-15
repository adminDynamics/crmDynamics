# Formato Específico para Mensajes de Telegram desde Botpress

## Formato JSON Esperado

El webhook `/api/botpress/webhook` ahora acepta mensajes en este formato específico:

\`\`\`json
{
  "conversationId": "conv_123456789",
  "messageId": "msg_987654321", 
  "userInfo": {
    "fullName": "Juan Pérez",
    "telegramId": 123456789
  },
  "message": "Hola, necesito ayuda con mi pedido",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "channel": "telegram"
}
\`\`\`

## Campos Requeridos

- `conversationId` (string): ID único de la conversación
- `messageId` (string): ID único del mensaje
- `userInfo.fullName` (string): Nombre completo del usuario
- `userInfo.telegramId` (number): ID numérico de Telegram del usuario

## Campos Opcionales

- `message` (string): Texto del mensaje (si no se proporciona, se usará string vacío)
- `timestamp` (string): Fecha y hora en formato ISO (si no se proporciona, se usa la fecha actual)
- `channel` (string): Canal de origen (default: "telegram")

## Endpoint de Prueba

Puedes probar el formato usando:

**URL:** `POST /api/botpress/test-client-message`

### Ejemplo de prueba con curl:

\`\`\`bash
curl -X POST https://tu-dominio.com/api/botpress/test-client-message \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_123456789",
    "messageId": "msg_987654321",
    "userInfo": {
      "fullName": "Juan Pérez", 
      "telegramId": 123456789
    },
    "message": "Hola, necesito ayuda",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }'
\`\`\`

### Respuesta exitosa:

\`\`\`json
{
  "success": true,
  "message": "Formato validado correctamente",
  "originalPayload": { /* tu payload original */ },
  "processedData": {
    "id": "msg_987654321",
    "conversationId": "conv_123456789", 
    "userId": "123456789",
    "userName": "Juan Pérez",
    "telegramId": 123456789,
    "messageText": "Hola, necesito ayuda",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "channel": "telegram",
    "status": "processed"
  },
  "validation": "passed"
}
\`\`\`

### Respuesta con error de formato:

\`\`\`json
{
  "success": false,
  "error": "Formato de datos inválido",
  "details": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string", 
      "path": ["userInfo", "telegramId"],
      "message": "Expected number, received string"
    }
  ],
  "expectedFormat": { /* formato esperado */ }
}
\`\`\`

## Procesamiento Interno

Cuando se recibe un mensaje con este formato, el sistema:

1. **Valida** el formato usando Zod schema
2. **Convierte** los datos al formato interno del CRM
3. **Guarda** el mensaje en la base de datos (o memoria temporal)
4. **Crea/actualiza** la conversación asociada
5. **Notifica** a los agentes disponibles
6. **Responde** con confirmación a Botpress

## Datos Almacenados

El mensaje se almacena con esta estructura interna:

\`\`\`typescript
{
  id: "msg_987654321",                    // messageId del payload
  conversationId: "conv_123456789",       // conversationId del payload  
  userId: "123456789",                    // telegramId convertido a string
  userName: "Juan Pérez",                 // fullName del payload
  telegramId: 123456789,                  // telegramId original
  messageText: "Hola, necesito ayuda",    // message del payload
  messageType: "text",                    // siempre "text" por defecto
  timestamp: "2024-01-15T10:30:00.000Z",  // timestamp del payload o actual
  channel: "telegram",                    // channel del payload o "telegram"
  direction: "incoming",                  // siempre "incoming" para mensajes de cliente
  metadata: {
    telegramId: 123456789,
    originalPayload: { /* payload original completo */ }
  }
}
\`\`\`

## Configuración en Botpress

Para enviar mensajes en este formato desde Botpress:

1. Configura un webhook en Botpress
2. URL: `https://tu-dominio.com/api/botpress/webhook`
3. Asegúrate de que el payload tenga exactamente la estructura mostrada arriba
4. El sistema detectará automáticamente este formato y lo procesará correctamente
