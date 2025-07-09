const express = require('express');
const { responderTelegram } = require('../controllers/telegramController');

const router = express.Router();

router.post('/api/responderTelegram', responderTelegram);

module.exports = router;
