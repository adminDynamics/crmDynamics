require('dotenv').config()
const axios = require('axios')
const express = require('express')
const cors = require('cors')
// const client = require('twilio')(process.env.SID, process.env.TOKEN)
// const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express()
const port = process.env.PORT || 3001

// Variable global para almacenar el último mensaje recibido
let ultimoMensaje = null;

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Endpoint para recibir el mensaje
app.post('/api/recibirMensaje', (req, res) => {
    try {
        const mensaje = req.body;
        ultimoMensaje = mensaje;
        res.status(200).json({ success: true, message: 'Mensaje almacenado correctamente' });
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

/* Código anterior comentado
app.post('/sendMessage', (req, res) => {
    client.messages.create({
        body: 'Soy el pai desde twillio',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+5491123893657'
    }).then(message => res.send(message));
})

app.post('/resiveMessage', async (req, res) => {
    console.log(res.body);
})

app.post('/resiveMessageStatus', async (req, res) => {
    console.log(res.body);
})
*/

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`)
}) 