const supabase = require('../config/supabaseClient.js');
const { insertarCliente, actualizarCliente } = require('../controllers/userTableController.js');

const channel = supabase
  .channel('users-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'users' },
    async (payload) => {
      console.log('🟢 Nuevo usuario:', payload.new);
      await insertarCliente(payload.new);
    }
  )
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'users' },
    async (payload) => {
      console.log('🟡 Usuario actualizado:', payload.new);
      await actualizarCliente(payload.new.telegram_id, payload.new);
    }
  )
  .subscribe();