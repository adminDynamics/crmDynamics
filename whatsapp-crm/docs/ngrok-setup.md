# Configurar ngrok para desarrollo local

## 1. Instalar ngrok
\`\`\`bash
# Opción 1: Descargar desde https://ngrok.com/download
# Opción 2: Con npm
npm install -g ngrok

# Opción 3: Con brew (Mac)
brew install ngrok
\`\`\`

## 2. Exponer tu aplicación local
\`\`\`bash
# En una terminal separada, ejecuta:
ngrok http 3000
\`\`\`

## 3. Copiar la URL pública
ngrok te dará una URL como:
\`\`\`
https://abc123.ngrok.io
\`\`\`

## 4. Configurar en Twilio
- Ve a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
- En "Webhook URL for Incoming Messages" pega:
  https://abc123.ngrok.io/api/whatsapp/webhook
- Método: POST
- Guardar

## 5. Probar
- Envía un mensaje desde tu WhatsApp al sandbox
- Deberías ver el mensaje en los logs de tu aplicación
