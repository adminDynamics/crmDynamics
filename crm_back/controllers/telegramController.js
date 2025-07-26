const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

export const responderTelegram = async (req, res) => {
  const { chatId, mensaje } = req.body;

  if (!chatId || !mensaje) {
    return res.status(400).json({ success: false, message: 'Faltan datos: chatId o mensaje' });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: mensaje }),
    });

    const data = await response.json();

    if (data.ok) {
      return res.status(200).json({ success: true, message: 'Mensaje enviado correctamente' });
    } else {
      return res.status(500).json({ success: false, error: data });
    }
  } catch (error) {
    console.error('❌ Error enviando mensaje a Telegram:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
