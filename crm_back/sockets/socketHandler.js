// Tipos de mensaje permitidos para WebSocket
const TIPOS_PERMITIDOS_WS = ['text', 'audio', 'image', 'document', 'file', 'video', 'location', 'contact'];
const FORMATOS_PERMITIDOS_WS = ['texto', 'audio', 'imagen', 'documento', 'archivo', 'video', 'ubicacion', 'contacto'];

// Función de validación de estructura del mensaje WebSocket
const validarEstructuraMensaje = (data) => {
  if (!data || typeof data !== 'object') {
    return { valido: false, error: 'El mensaje debe ser un objeto válido' };
  }

  const camposRequeridos = ['tipo', 'message', 'user_id', 'chat_id'];
  const camposFaltantes = camposRequeridos.filter(campo => !data[campo]);
  
  if (camposFaltantes.length > 0) {
    return { 
      valido: false, 
      error: `Campos faltantes: ${camposFaltantes.join(', ')}` 
    };
  }

  return { valido: true };
};

// Función de validación de mensaje para WebSocket
const validarMensajeWS = (mensaje) => {
  if (!mensaje || typeof mensaje !== 'string') {
    return { valido: false, error: 'El mensaje debe ser una cadena de texto válida' };
  }
  
  if (mensaje.trim().length === 0) {
    return { valido: false, error: 'El mensaje no puede estar vacío' };
  }
  
  if (mensaje.length > 4000) {
    return { valido: false, error: 'El mensaje no puede exceder 4000 caracteres' };
  }
  
  return { valido: true };
};

// Función de validación de tipo para WebSocket
const validarTipoWS = (tipo) => {
  if (!tipo || typeof tipo !== 'string') {
    return { valido: false, error: 'El tipo debe ser una cadena de texto válida' };
  }
  
  if (!TIPOS_PERMITIDOS_WS.includes(tipo.toLowerCase())) {
    return { 
      valido: false, 
      error: `Tipo no permitido. Tipos válidos: ${TIPOS_PERMITIDOS_WS.join(', ')}` 
    };
  }
  
  return { valido: true };
};

// Función de validación de formato para WebSocket
const validarFormatoWS = (formato) => {
  if (!formato || typeof formato !== 'string') {
    return { valido: false, error: 'El formato debe ser una cadena de texto válida' };
  }
  
  if (!FORMATOS_PERMITIDOS_WS.includes(formato.toLowerCase())) {
    return { 
      valido: false, 
      error: `Formato no permitido. Formatos válidos: ${FORMATOS_PERMITIDOS_WS.join(', ')}` 
    };
  }
  
  return { valido: true };
};

// Función de validación de userId para WebSocket
const validarUserIdWS = (userId) => {
  if (!userId || typeof userId !== 'string') {
    return { valido: false, error: 'El user_id debe ser una cadena de texto válida' };
  }
  
  if (userId.trim().length === 0) {
    return { valido: false, error: 'El user_id no puede estar vacío' };
  }
  
  if (userId.length > 100) {
    return { valido: false, error: 'El user_id no puede exceder 100 caracteres' };
  }
  
  return { valido: true };
};

// Función de validación de chatId para WebSocket
const validarChatIdWS = (chatId) => {
  if (!chatId || typeof chatId !== 'string') {
    return { valido: false, error: 'El chat_id debe ser una cadena de texto válida' };
  }
  
  if (chatId.trim().length === 0) {
    return { valido: false, error: 'El chat_id no puede estar vacío' };
  }
  
  if (chatId.length > 100) {
    return { valido: false, error: 'El chat_id no puede exceder 100 caracteres' };
  }
  
  return { valido: true };
};

// Función de validación de timestamp para WebSocket
const validarTimestampWS = (timestamp) => {
  if (!timestamp) {
    return { valido: true, valor: new Date() };
  }
  
  const fecha = new Date(timestamp);
  if (isNaN(fecha.getTime())) {
    return { valido: false, error: 'El timestamp debe ser una fecha válida' };
  }
  
  // Verificar que no sea una fecha futura (con tolerancia de 5 minutos)
  const ahora = new Date();
  const cincoMinutos = 5 * 60 * 1000;
  if (fecha.getTime() > ahora.getTime() + cincoMinutos) {
    return { valido: false, error: 'El timestamp no puede ser una fecha futura' };
  }
  
  return { valido: true, valor: fecha };
};

export default (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Cliente WebSocket conectado:', socket.id);

    socket.on('mensaje', (data) => {
      try {
        console.log('📨 Mensaje recibido por WebSocket:', JSON.stringify(data, null, 2));

        // Validación de estructura básica
        const validacionEstructura = validarEstructuraMensaje(data);
        if (!validacionEstructura.valido) {
          console.error('❌ Error de validación WebSocket - Estructura:', validacionEstructura.error);
          socket.emit('error', {
            success: false,
            message: validacionEstructura.error,
            code: 'VALIDATION_ERROR'
          });
          return;
        }

        // Validaciones específicas
        const validacionMensaje = validarMensajeWS(data.message);
        if (!validacionMensaje.valido) {
          console.error('❌ Error de validación WebSocket - Mensaje:', validacionMensaje.error);
          socket.emit('error', {
            success: false,
            message: validacionMensaje.error,
            code: 'MESSAGE_VALIDATION_ERROR'
          });
          return;
        }

        const validacionTipo = validarTipoWS(data.tipo);
        if (!validacionTipo.valido) {
          console.error('❌ Error de validación WebSocket - Tipo:', validacionTipo.error);
          socket.emit('error', {
            success: false,
            message: validacionTipo.error,
            code: 'TYPE_VALIDATION_ERROR'
          });
          return;
        }

        const validacionUserId = validarUserIdWS(data.user_id);
        if (!validacionUserId.valido) {
          console.error('❌ Error de validación WebSocket - UserId:', validacionUserId.error);
          socket.emit('error', {
            success: false,
            message: validacionUserId.error,
            code: 'USER_ID_VALIDATION_ERROR'
          });
          return;
        }

        const validacionChatId = validarChatIdWS(data.chat_id);
        if (!validacionChatId.valido) {
          console.error('❌ Error de validación WebSocket - ChatId:', validacionChatId.error);
          socket.emit('error', {
            success: false,
            message: validacionChatId.error,
            code: 'CHAT_ID_VALIDATION_ERROR'
          });
          return;
        }

        const validacionTimestamp = validarTimestampWS(data.timestamp);
        if (!validacionTimestamp.valido) {
          console.error('❌ Error de validación WebSocket - Timestamp:', validacionTimestamp.error);
          socket.emit('error', {
            success: false,
            message: validacionTimestamp.error,
            code: 'TIMESTAMP_VALIDATION_ERROR'
          });
          return;
        }

        // Validación de formato si viene
        if (data.formato) {
          const validacionFormato = validarFormatoWS(data.formato);
          if (!validacionFormato.valido) {
            console.error('❌ Error de validación WebSocket - Formato:', validacionFormato.error);
            socket.emit('error', {
              success: false,
              message: validacionFormato.error,
              code: 'FORMAT_VALIDATION_ERROR'
            });
            return;
          }
        }

        // Detección automática de formato si no viene
        let formato = data.formato;
        if (!formato) {
          if (data.message.startsWith('http') && data.message.includes('.oga')) formato = 'audio';
          else if (data.message.startsWith('http') && data.message.match(/\.(jpg|jpeg|png|webp|gif)/i)) formato = 'imagen';
          else if (data.message.startsWith('http') && data.message.match(/\.(pdf|docx?|xlsx?|pptx?|txt)/i)) formato = 'documento';
          else if (data.message.startsWith('http') && data.message.match(/\.(mp4|avi|mov|wmv)/i)) formato = 'video';
          else if (data.message.startsWith('http')) formato = 'archivo';
          else formato = 'texto';
        }

        // Crear mensaje validado
        const mensajeValidado = {
          tipo: data.tipo.toLowerCase(),
          formato: formato.toLowerCase(),
          message: data.message.trim(),
          user_id: data.user_id.trim(),
          conversation_id: data.conversation_id || null,
          chat_id: data.chat_id.trim(),
          timestamp: validacionTimestamp.valor
        };

        console.log('✅ Mensaje WebSocket validado y enviando:', JSON.stringify(mensajeValidado, null, 2));
        
        // Enviar mensaje validado a todos los clientes
        io.emit('mensaje', mensajeValidado);
        
        // Confirmar al cliente que envió el mensaje
        socket.emit('mensajeConfirmado', {
          success: true,
          message: 'Mensaje enviado correctamente',
          data: {
            id: mensajeValidado.timestamp.getTime(),
            tipo: mensajeValidado.tipo,
            formato: mensajeValidado.formato
          }
        });

      } catch (error) {
        console.error('❌ Error inesperado en WebSocket:', error);
        socket.emit('error', {
          success: false,
          message: 'Error interno del servidor',
          code: 'INTERNAL_ERROR'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Cliente WebSocket desconectado:', socket.id);
    });

    // Manejo de errores de socket
    socket.on('error', (error) => {
      console.error('❌ Error en socket:', socket.id, error);
    });
  });
};