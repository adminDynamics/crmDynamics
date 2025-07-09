const express = require('express');
const {
  recibirMensaje,
  obtenerUltimoMensaje,
  insertarMensajeManual
} = require('../controllers/mensajeController');

function mensajeRoutes(io) {
  const router = express.Router();

  router.post('/api/recibirMensaje', recibirMensaje(io));
  router.get('/api/obtenerMensaje', obtenerUltimoMensaje);
  router.post('/mensajes', insertarMensajeManual);

  return router;
}

module.exports = mensajeRoutes;
