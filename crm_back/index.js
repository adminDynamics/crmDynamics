require('dotenv').config()
const axios = require('axios')
const express = require('express')
const cors = require('cors')
const http = require('http');
const { Server } = require('socket.io');
// const client = require('twilio')(process.env.SID, process.env.TOKEN)
// const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express()
const port = process.env.PORT || 3001

// Variable global para almacenar el último mensaje recibido
let ultimoMensaje = null;

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Endpoint para recibir el mensaje desde Botpress
app.post('/api/recibirMensaje', (req, res) => {
    try {
        const mensaje = req.body;
        ultimoMensaje = mensaje;

        // Emitir mensaje a todos los sockets conectados
        io.emit('mensaje', mensaje);

        res.status(200).json({ success: true, message: 'Mensaje enviado por WebSocket' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar el mensaje' });
    }
});

// Endpoint para obtener el último mensaje
app.get('/api/obtenerMensaje', (req, res) => {
    if (ultimoMensaje) {
        res.status(200).json(ultimoMensaje);
    } else {
        res.status(404).json({ success: false, message: 'No hay mensajes almacenados' });
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
    console.log('Cliente conectado por WebSocket');

    // Enviar el último mensaje al conectar
    if (ultimoMensaje) {
        socket.emit('mensaje', ultimoMensaje);
    }

    // Recibir mensajes desde el cliente
    socket.on('mensaje', (data) => {
        ultimoMensaje = data;
        // Reenviar a todos los clientes conectados
        io.emit('mensaje', data);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port} (HTTP y WebSocket)`);
}); 