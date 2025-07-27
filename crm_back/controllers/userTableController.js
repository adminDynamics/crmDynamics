import supabase from '../config/supabaseClient.js';
import clientbp from '../config/bpClient.js';
import { obtenerUsuariosRecientes, exportarCSV } from '../utils/traeUsuariosRecientes.js';
import fs from 'fs';
import FormData from 'form-data';

export async function insertarCliente(newClient) {
  const { telegram_id, full_name, bot_activo, created_at } = newClient;
  const { rows, errors, warnings } = await clientbp.createTableRows({
    table: 'UserTable',
    rows: [{
          telegram_id: telegram_id.toString(),
          full_name: full_name,
          bot_activo: bot_activo,
          //created_at: created_at
      }]
    });

}  

export async function actualizarCliente(clienteId, nuevosDatos) {
  try {
    console.log('🛠️ Iniciando actualización en Botpress para:', clienteId);

    // Buscar el registro en la tabla de Botpress por telegram_id
    const { rows } = await clientbp.findTableRows({
      table: 'UserTable',
      filter: {
        telegram_id: clienteId.toString()
      }
    });

    if (!rows || rows.length === 0) {
      console.warn(`⚠️ No se encontró el usuario con telegram_id ${clienteId} en Botpress.`);
      return;
    }

    // Obtenemos el ID real de la tabla de Botpress
    const botpressId = rows[0].id;

    console.log('🧾 ID de Botpress encontrado:', botpressId);

    // Preparamos la fila con el ID correcto
    const updateRow = {
      id: botpressId,
      bot_activo: typeof nuevosDatos.bot_activo === 'boolean'
        ? nuevosDatos.bot_activo
        : false,
      telegram_id: clienteId.toString()
    };

    const { rows: updatedRows, errors, warnings } = await clientbp.updateTableRows({
      table: 'UserTable',
      rows: [updateRow]
    });

    if (errors?.length) console.error('❌ Errores al actualizar en Botpress:', errors);
    if (warnings?.length) console.warn('⚠️ Advertencias al actualizar en Botpress:', warnings);
    console.log('✅ Botpress actualizado con éxito:', updatedRows);

  } catch (error) {
    console.error('❌ Error inesperado en actualizarCliente:', error.message);
  }
}




// ⛔ Subir archivo CSV a Botpress
export async function subirArchivoABotpress(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await fetch(`${process.env.BOTPRESS_API_URL}/v1/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.BOTPRESS_ACCESS_TOKEN}`
    },
    body: form
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`❌ Error al subir archivo: ${data.message}`);
  return data.file.id;
}

// ⬇️ Importar CSV en tabla Botpress
export async function importarCSVEnBotpress(fileId) {
  const { job } = await clientbp.importTable({
    table: 'UserTable',
    fileId
  });
  console.log('📦 Import iniciado. Job ID:', job.id);
}
    
// Eliminar todos los registros y reemplazar con nuevos datos de Supabase
export async function reemplazarTabla() {
  const { deletedRows } = await clientbp.deleteTableRows({
    table: 'UserTable',
    deleteAllRows: true
  });

  console.log(`🧹 Tabla limpiada (${deletedRows?.length || 0} registros)`);

  const usuarios = await obtenerUsuariosRecientes();
  await exportarCSV(usuarios);
  const fileId = await subirArchivoABotpress('usuarios.csv');
  await importarCSVEnBotpress(fileId);
}
  
  
