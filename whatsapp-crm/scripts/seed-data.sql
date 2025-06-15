-- Insertar datos de ejemplo para el CRM de WhatsApp

-- Insertar agentes de ejemplo
INSERT INTO agents (name, email, status, max_chats, active_chats) VALUES
('Ana García', 'ana.garcia@empresa.com', 'online', 8, 3),
('Carlos López', 'carlos.lopez@empresa.com', 'online', 10, 5),
('María Rodríguez', 'maria.rodriguez@empresa.com', 'busy', 8, 8),
('Juan Pérez', 'juan.perez@empresa.com', 'offline', 6, 0),
('Sofia Martín', 'sofia.martin@empresa.com', 'online', 7, 2)
ON CONFLICT (email) DO NOTHING;

-- Insertar contactos de ejemplo
INSERT INTO contacts (name, phone, priority, status, assigned_agent_id) VALUES
('Cliente Premium', '+34612345678', 'high', 'unread', NULL),
('María González', '+34687654321', 'medium', 'assigned', 1),
('Empresa ABC', '+34654987123', 'medium', 'unread', NULL),
('Pedro Martín', '+34698741852', 'low', 'resolved', 2),
('Laura Sánchez', '+34611223344', 'high', 'assigned', 1),
('Tech Solutions SL', '+34622334455', 'medium', 'unread', NULL),
('Roberto Díaz', '+34633445566', 'low', 'resolved', 3)
ON CONFLICT (phone) DO NOTHING;

-- Insertar conversaciones de ejemplo
INSERT INTO conversations (contact_id, assigned_agent_id, status, priority) VALUES
(1, NULL, 'active', 'high'),
(2, 1, 'active', 'medium'),
(3, NULL, 'active', 'medium'),
(4, 2, 'resolved', 'low'),
(5, 1, 'active', 'high'),
(6, NULL, 'active', 'medium'),
(7, 3, 'resolved', 'low');

-- Insertar mensajes de ejemplo
INSERT INTO messages (conversation_id, sender_type, sender_id, message_text, status) VALUES
-- Conversación 1 (Cliente Premium)
(1, 'customer', NULL, 'Hola, necesito ayuda con mi pedido urgente', 'delivered'),

-- Conversación 2 (María González)
(2, 'customer', NULL, 'Hola, tengo una consulta sobre mi factura', 'read'),
(2, 'agent', 1, 'Hola María, por supuesto te ayudo con tu consulta. ¿Podrías proporcionarme tu número de factura?', 'read'),
(2, 'customer', NULL, 'Sí, es la factura #F-2024-001', 'read'),
(2, 'agent', 1, 'Perfecto, déjame revisar esa factura...', 'delivered'),

-- Conversación 3 (Empresa ABC)
(3, 'customer', NULL, '¿Tienen disponibilidad para mañana?', 'delivered'),

-- Conversación 4 (Pedro Martín - Resuelta)
(4, 'customer', NULL, 'Tengo un problema con el producto', 'read'),
(4, 'agent', 2, 'Hola Pedro, lamento escuchar eso. ¿Podrías contarme más detalles?', 'read'),
(4, 'customer', NULL, 'El producto no funciona como esperaba', 'read'),
(4, 'agent', 2, 'Entiendo, vamos a solucionarlo. Te envío las instrucciones...', 'read'),
(4, 'customer', NULL, 'Perfecto, problema resuelto. Gracias!', 'read'),

-- Conversación 5 (Laura Sánchez)
(5, 'customer', NULL, 'Urgente: necesito cambiar mi pedido', 'read'),
(5, 'agent', 1, 'Hola Laura, entiendo la urgencia. ¿Qué cambios necesitas hacer?', 'delivered');

-- Insertar configuración de Twilio real
INSERT INTO twilio_config (account_sid, auth_token, whatsapp_number, webhook_url, is_active) VALUES
('AC51c826d5c1c354576b17aa36806014b7', '5ea7bd2ff92be3ef92981b63a3f01d00', 'whatsapp:+19472227136', 'https://tu-dominio.com/api/whatsapp/webhook', true)
ON CONFLICT DO NOTHING;
