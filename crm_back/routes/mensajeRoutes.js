import express from 'express';
import {
  recibirMensaje,
  obtenerUltimoMensaje,
  insertarMensajeManual
} from '../controllers/mensajeController.js';

function mensajeRoutes(io) {
  const router = express.Router();

  router.post('/api/recibirMensaje', recibirMensaje(io));
  router.get('/api/obtenerMensaje', obtenerUltimoMensaje);
  router.post('/mensajes', insertarMensajeManual);

  return router;
}

export default mensajeRoutes;
