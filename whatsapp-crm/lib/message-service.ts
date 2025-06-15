// Servicio para gestionar mensajes (simulado)
// En producción, esto se conectaría a tu base de datos

interface MessageMedia {
  url: string
  contentType?: string
  index?: number
}

interface MessageData {
  from: string
  to: string
  profileName?: string
  text: string
  messageSid: string
  messageType?: string
  media?: MessageMedia[]
  timestamp: string
  status?: string
  rawData?: Record<string, any>
}

// Almacenamiento temporal en memoria (solo para desarrollo)
const messages: MessageData[] = []

// En producción, esto se conectaría a tu base de datos
export async function saveIncomingMessage(messageData: MessageData): Promise<void> {
  console.log("Guardando mensaje entrante:", messageData.messageSid)

  // Aquí implementarías la lógica para guardar en tu base de datos
  // Ejemplo con PostgreSQL:
  /*
  const { pool } = require('@/lib/db');
  
  await pool.query(
    `INSERT INTO messages 
     (message_sid, from_number, to_number, message_text, profile_name, message_type, timestamp, status, raw_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      messageData.messageSid,
      messageData.from,
      messageData.to,
      messageData.text,
      messageData.profileName,
      messageData.messageType || 'whatsapp',
      new Date(messageData.timestamp),
      'received',
      JSON.stringify(messageData.rawData || {})
    ]
  );
  
  // Si hay medios, guardarlos también
  if (messageData.media && messageData.media.length > 0) {
    for (const media of messageData.media) {
      await pool.query(
        `INSERT INTO message_media
         (message_sid, media_url, content_type, media_index)
         VALUES ($1, $2, $3, $4)`,
        [
          messageData.messageSid,
          media.url,
          media.contentType,
          media.index
        ]
      );
    }
  }
  */

  // Para desarrollo, simplemente lo agregamos al array en memoria
  messages.push({ ...messageData })

  // También deberíamos actualizar o crear el contacto
  await updateOrCreateContact(messageData.from, messageData.profileName)

  // Y actualizar o crear la conversación
  await updateOrCreateConversation(messageData.from, messageData.to)
}

export async function saveOutgoingMessage(messageData: MessageData): Promise<void> {
  console.log("Guardando mensaje saliente:", messageData.messageSid)

  // Similar a saveIncomingMessage, pero con status 'sent'
  messages.push({ ...messageData, status: "sent" })

  // Actualizar la conversación
  await updateOrCreateConversation(messageData.to, messageData.from)
}

async function updateOrCreateContact(phoneNumber: string, name?: string): Promise<void> {
  console.log(`Actualizando contacto: ${phoneNumber} (${name || "Sin nombre"})`)

  // Aquí implementarías la lógica para actualizar o crear un contacto
  // Ejemplo:
  /*
  const { pool } = require('@/lib/db');
  
  // Verificar si el contacto existe
  const contactResult = await pool.query(
    'SELECT id FROM contacts WHERE phone = $1',
    [phoneNumber]
  );
  
  if (contactResult.rows.length === 0) {
    // Crear nuevo contacto
    await pool.query(
      'INSERT INTO contacts (phone, name, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
      [phoneNumber, name || 'Usuario ' + phoneNumber.substring(phoneNumber.length - 4)]
    );
  } else if (name) {
    // Actualizar nombre si se proporciona
    await pool.query(
      'UPDATE contacts SET name = $1, updated_at = NOW() WHERE phone = $2',
      [name, phoneNumber]
    );
  }
  */
}

async function updateOrCreateConversation(customerPhone: string, businessPhone: string): Promise<void> {
  console.log(`Actualizando conversación para: ${customerPhone}`)

  // Aquí implementarías la lógica para actualizar o crear una conversación
  // Ejemplo:
  /*
  const { pool } = require('@/lib/db');
  
  // Obtener el ID del contacto
  const contactResult = await pool.query(
    'SELECT id FROM contacts WHERE phone = $1',
    [customerPhone]
  );
  
  if (contactResult.rows.length === 0) {
    console.error('No se encontró el contacto');
    return;
  }
  
  const contactId = contactResult.rows[0].id;
  
  // Verificar si la conversación existe
  const conversationResult = await pool.query(
    'SELECT id FROM conversations WHERE contact_id = $1',
    [contactId]
  );
  
  if (conversationResult.rows.length === 0) {
    // Crear nueva conversación
    await pool.query(
      `INSERT INTO conversations 
       (contact_id, status, last_message_at, created_at, updated_at) 
       VALUES ($1, 'active', NOW(), NOW(), NOW())`,
      [contactId]
    );
  } else {
    // Actualizar conversación existente
    await pool.query(
      `UPDATE conversations 
       SET last_message_at = NOW(), updated_at = NOW(), status = 'active' 
       WHERE contact_id = $1`,
      [contactId]
    );
  }
  */
}

export async function getMessagesByPhone(phoneNumber: string): Promise<MessageData[]> {
  // En producción, esto consultaría tu base de datos
  return messages.filter((m) => m.from === phoneNumber || m.to === phoneNumber)
}

export async function getAllMessages(): Promise<MessageData[]> {
  // En producción, esto consultaría tu base de datos con paginación
  return [...messages]
}
