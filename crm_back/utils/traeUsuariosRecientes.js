import supabase from '../config/supabaseClient.js';
import { exportarCSV } from './jsonToCsv.js';

// Obtener datos desde Supabase
export const obtenerUsuariosRecientes = async () => {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  const desde = ayer.toISOString().slice(0, 10);
  const hasta = hoy.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .gte('created_at', `${desde}T00:00:00`)
    .lte('created_at', `${hasta}T23:59:59`);

  if (error) throw error;
  return data;
};

export { exportarCSV };




