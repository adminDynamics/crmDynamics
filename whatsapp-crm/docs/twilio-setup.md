# Configuración de Twilio para Número Real

## Variables de Entorno Necesarias

\`\`\`env
# Credenciales principales de Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Número de teléfono comprado en Twilio (con formato internacional)
TWILIO_PHONE_NUMBER=+1234567890

# Configuración de WhatsApp Business (si aplica)
TWILIO_WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxxxxxxx

# Configuración de prefijo WhatsApp
# true = usar prefijo "whatsapp:" (para sandbox o algunos casos de WhatsApp Business)
# false = no usar prefijo (para SMS o algunos casos de WhatsApp Business)
TWILIO_USE_WHATSAPP_PREFIX=false

# URL pública para webhooks (opcional, para referencia)
NEXT_PUBLIC_WEBHOOK_URL=https://tu-dominio.com
\`\`\`

## Configuración de Webhook en Twilio

### Para SMS:

1. Ve a: https://console.twilio.com/
2. Navega a: Phone Numbers > Manage > Active Numbers
3. Selecciona tu número
4. En "Messaging Configuration":
   - A MESSAGE COMES IN: Webhook
   - URL: https://tu-dominio.com/api/whatsapp/webhook
   - HTTP Method: POST

### Para WhatsApp Business:

1. Ve a: https://console.twilio.com/
2. Navega a: Messaging > Settings > WhatsApp Senders
3. Selecciona tu número de WhatsApp Business
4. En "Sandbox Configuration":
   - WHEN A MESSAGE COMES IN: https://tu-dominio.com/api/whatsapp/webhook
   - HTTP Method: POST

## Diferencias entre Número Real y Sandbox

| Característica | Número Real | Sandbox |
|----------------|-------------|---------|
| Formato número | Varía según configuración | Siempre `whatsapp:+número` |
| Limitaciones | Sin restricciones de destinatarios | Solo números registrados |
| Plantillas | Requiere plantillas aprobadas para iniciar conversaciones | No requiere plantillas en sandbox |
| Costo | Según plan de Twilio | Gratuito para desarrollo |
| Caducidad | No caduca | Puede requerir reactivación |

## Verificación de Configuración

Para verificar que tu configuración es correcta:

1. Envía un mensaje de prueba desde la interfaz del CRM
2. Verifica los logs del servidor para confirmar el envío
3. Envía un mensaje al número desde WhatsApp o SMS
4. Verifica que el webhook reciba el mensaje correctamente

## Solución de Problemas Comunes

### Error "Channel not found"
- Verifica que estés usando el formato correcto para el número FROM
- Ajusta TWILIO_USE_WHATSAPP_PREFIX según corresponda

### Error "Message cannot be sent"
- Para WhatsApp Business: verifica que tengas plantillas aprobadas
- Para SMS: verifica que el número tenga capacidades de SMS

### Webhook no recibe mensajes
- Verifica la URL configurada en Twilio
- Asegúrate de que tu servidor sea accesible públicamente
- Revisa los logs de Twilio para ver si hay errores de entrega
