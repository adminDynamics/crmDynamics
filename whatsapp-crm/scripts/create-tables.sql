-- Crear tablas para el CRM de WhatsApp

-- Tabla de agentes
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'offline')),
    max_chats INTEGER DEFAULT 8,
    active_chats INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contactos/clientes
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'assigned', 'resolved')),
    assigned_agent_id INTEGER REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) NOT NULL,
    assigned_agent_id INTEGER REFERENCES agents(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'agent')),
    sender_id INTEGER, -- ID del agente si sender_type = 'agent'
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio')),
    whatsapp_message_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de Twilio WhatsApp
DROP TABLE IF EXISTS whatsapp_config;
CREATE TABLE IF NOT EXISTS twilio_config (
    id SERIAL PRIMARY KEY,
    account_sid VARCHAR(255) NOT NULL,
    auth_token TEXT NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL, -- formato: whatsapp:+14155238886
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
