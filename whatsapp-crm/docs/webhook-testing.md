# Probar el Webhook

## 1. Verificar que tu aplicación esté corriendo
\`\`\`bash
npm run dev
# Aplicación en http://localhost:3000
\`\`\`

## 2. Ejecutar ngrok en otra terminal
\`\`\`bash
ngrok http 3000
# Copia la URL HTTPS que aparece
\`\`\`

## 3. Configurar en Twilio Sandbox
- URL: https://tu-url-ngrok.ngrok.io/api/whatsapp/webhook
- Método: POST

## 4. Registrar tu número en el sandbox
- Envía "join [código]" al +1 415 523 8886

## 5. Enviar mensaje de prueba
- Envía cualquier mensaje desde tu WhatsApp
- Verifica en los logs de tu aplicación que llegue el webhook

## 6. Logs esperados
\`\`\`
Mensaje recibido de +1234567890 (Tu Nombre): Hola, esto es una prueba
Datos del mensaje procesado: {
  from: "+1234567890",
  profileName: "Tu Nombre",
  text: "Hola, esto es una prueba",
  messageSid: "SM...",
  timestamp: "2024-01-15T10:30:00.000Z"
}
