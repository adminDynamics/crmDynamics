# Integración con Botpress - Documentación

## Endpoints Disponibles

### 1. Webhook Principal
**URL:** `POST /api/botpress/webhook`

Recibe todos los eventos de Botpress en formato JSON.

#### Tipos de eventos soportados:

- `message_received` - Mensaje del cliente
- `message_sent` - Mensaje enviado por agente
- `bot_response` - Respuesta automática del bot
- `conversation_started` - Nueva conversación
- `conversation_ended` - Conversación finalizada
- `user_joined` - Nuevo usuario registrado

#### Ejemplo de payload para mensaje del cliente:
\`\`\`json
{
  "type": "message_received",
  "id": "msg_123456",
  "conversationId": "conv_789012",
  "userId": "user_345678",
  "user": {
    "id": "user_345678",
    "name": "Juan Pérez",
    "phone": "+34612345678",
    "email": "juan@example.com",
    "tags": {
      "source": "whatsapp",
      "priority": "high"
    }
  },
  "payload": {
    "type": "text",
    "text": "Hola, necesito ayuda con mi pedido",
    "files": [] // Para archivos adjuntos
  },
  "channel": "whatsapp",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "botId": "bot_123",
  "integrationId": "integration_456"
}
\`\`\`

#### Ejemplo de payload para respuesta del bot:
\`\`\`json
{
  "type": "bot_response",
  "id": "msg_789012",
  "conversationId": "conv_789012",
  "userId": "user_345678",
  "payload": {
    "type": "text",
    "text": "Hola Juan, ¿en qué puedo ayudarte hoy?"
  },
  "channel": "whatsapp",
  "timestamp": "2024-01-15T10:30:05.000Z",
  "botId": "bot_123",
  "confidence": 0.95,
  "intent": "greeting"
}
\`\`\`

### 2. Enviar Mensajes
**URL:** `POST /api/botpress/send`

Envía mensajes desde el CRM hacia Botpress.

#### Payload:
\`\`\`json
{
  "conversationId": "conv_789012",
  "userId": "user_345678",
  "message": "Gracias por contactarnos, un agente te atenderá pronto",
  "messageType": "text",
  "agentId": "agent_123"
}
\`\`\`

### 3. Obtener Conversaciones
**URL:** `GET /api/botpress/conversations`

#### Parámetros de consulta:
- `status` - active, ended, all (opcional)
- `limit` - número de resultados (default: 50)
- `offset` - para paginación (default: 0)

#### Ejemplo:
\`\`\`
GET /api/botpress/conversations?status=active&limit=20&offset=0
\`\`\`

### 4. Obtener Mensajes de Conversación
**URL:** `GET /api/botpress/conversations/{id}/messages`

#### Parámetros de consulta:
- `limit` - número de mensajes (default: 100)
- `offset` - para paginación (default: 0)

## Configuración en Botpress

### 1. Configurar Webhook en Botpress:

1. Ve a tu instancia de Botpress
2. Navega a Integrations > Webhooks
3. Agrega un nuevo webhook:
   - URL: `https://tu-dominio.com/api/botpress/webhook`
   - Eventos: Selecciona todos los eventos que quieres recibir
   - Headers: Agrega autenticación si es necesario

### 2. Variables de Entorno (opcional):

\`\`\`env
BOTPRESS_API_TOKEN=tu_token_de_botpress
BOTPRESS_WEBHOOK_SECRET=tu_secreto_para_validar_webhooks
BOTPRESS_BOT_ID=tu_bot_id
\`\`\`

## Flujo de Datos

1. **Cliente envía mensaje** → Botpress → Webhook → CRM
2. **Bot responde** → Botpress → Webhook → CRM
3. **Agente responde** → CRM → API Send → Botpress → Cliente

## Estructura de Datos

### Mensaje:
- `id` - ID único del mensaje
- `conversationId` - ID de la conversación
- `userId` - ID del usuario
- `userName` - Nombre del usuario
- `messageText` - Texto del mensaje
- `messageType` - Tipo (text, image, file, etc.)
- `timestamp` - Fecha y hora
- `direction` - incoming/outgoing
- `metadata` - Datos adicionales

### Conversación:
- `id` - ID único de la conversación
- `userId` - ID del usuario
- `status` - active/ended/paused
- `channel` - whatsapp/telegram/web/etc.
- `startedAt` - Fecha de inicio
- `lastMessageAt` - Último mensaje
- `assignedAgentId` - Agente asignado

## Ejemplo de Integración

\`\`\`javascript
// Configurar webhook en Botpress
const webhookConfig = {
  url: 'https://tu-crm.com/api/botpress/webhook',
  events: [
    'message_received',
    'bot_response',
    'conversation_started'
  ],
  headers: {
    'Authorization': 'Bearer tu-token',
    'Content-Type': 'application/json'
  }
};

// Enviar mensaje desde CRM
const sendMessage = async (conversationId, userId, message) => {
  const response = await fetch('/api/botpress/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversationId,
      userId,
      message,
      agentId: 'current-agent-id'
    })
  });
  
  return response.json();
};
\`\`\`
