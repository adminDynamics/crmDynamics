app.post('/webhook/supabase-usuarios', async (req, res) => {
  const payload = req.body

  console.log('📨 Webhook recibido:', JSON.stringify(payload, null, 2))

  const evento = payload.type || payload.eventType
  const data = payload.new || payload.record

  if (!data?.telegram_id) {
    return res.status(400).send('Falta telegram_id')
  }

  try {
    if (evento === 'INSERT') {
      await insertarCliente(data)
    } else if (evento === 'UPDATE') {
      await actualizarCliente(data.telegram_id, data)
    }
    res.status(200).send('✅ Actualizado en Botpress')
  } catch (err) {
    console.error('❌ Error procesando webhook:', err)
    res.status(500).send('Error al actualizar cliente')
  }
})