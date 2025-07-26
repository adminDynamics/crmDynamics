import express from 'express';
import { responderTelegram } from '../controllers/telegramController.js';

const router = express.Router();

router.post('/api/responderTelegram', responderTelegram);

export default router;
