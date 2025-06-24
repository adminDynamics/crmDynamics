require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http');
const { Server } = require('socket.io');

const app = express()
const port = process.env.PORT || 3001

let ultimoMensaje = null;

app.use(express.json());
app.use(cors());

// Validar y registrar los mensajes recibidos
app.post('/api/recibirMensaje', (req, res) => {
    const { tipo, mensaje, userId, conversationId, timestamp } = req.body;

    if (!tipo || !mensaje || !userId) {
        console.warn('❌ Mensaje recibido incompleto:', req.body);
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos: tipo, mensaje o userId' });
    }

    const nuevoMensaje = {
        tipo,
        mensaje,
        userId,
        conversationId,
        timestamp: timestamp || new Date().toISOString()
    };

    ultimoMensaje = nuevoMensaje;
    console.log('✅ Mensaje recibido y emitido:', nuevoMensaje);
    io.emit('mensaje', nuevoMensaje);

    return res.status(200).json({ success: true, message: 'Mensaje procesado correctamente' });
});

// Ver el último mensaje (opcional)
app.get('/api/obtenerMensaje', (req, res) => {
    if (ultimoMensaje) {
        console.log('📤 Último mensaje entregado vía GET');
        return res.status(200).json(ultimoMensaje);
    } else {
        return res.status(404).json({ success: false, message: 'No hay mensajes almacenados' });
    }
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('🔌 Cliente WebSocket conectado');

    // ❌ Eliminado: reenvío automático del último mensaje
    // Esto evitaba confusión con mensajes viejos al entrar al CRM

    socket.on('mensaje', (data) => {
        ultimoMensaje = data;
        io.emit('mensaje', data);
        console.log('📥 Mensaje recibido desde el cliente y emitido:', data);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Cliente WebSocket desconectado');
    });
});

server.listen(port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${port} (HTTP y WebSocket)`);
});
