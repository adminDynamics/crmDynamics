# Backend WhatsApp con Twilio

Este es un backend simple para manejar mensajes de WhatsApp usando Twilio.

## Requisitos previos

- Node.js instalado
- Cuenta de Twilio con WhatsApp habilitado
- Credenciales de Twilio (Account SID y Auth Token)

## Instalación

1. Clona este repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

## Uso

1. Inicia el servidor:
```bash
npm run dev
```

2. El servidor se ejecutará en el puerto 3000 por defecto.

## Endpoints

### Recibir mensajes (Webhook)
- URL: `/webhook`
- Método: POST
- Configura esta URL en tu panel de Twilio como webhook para mensajes entrantes

### Enviar mensajes
- URL: `/send-message`
- Método: POST
- Body:
```json
{
    "to": "+1234567890",
    "message": "Tu mensaje aquí"
}
```

## Notas importantes

- Asegúrate de que tu número de WhatsApp esté verificado en Twilio
- El número de teléfono debe incluir el código de país (ejemplo: +54 para Argentina)
- Para desarrollo local, necesitarás usar un servicio como ngrok para exponer tu servidor local a internet 