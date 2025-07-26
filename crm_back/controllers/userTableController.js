import supabase from '../config/supabaseClient.js'
import clientbp from './bpClient.js'
import { obtenerUsuariosRecientes,exportarCSV } from '../utils/traeUsuariosRecientes.js'
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'
import express from 'express'
import dotenv from 'dotenv'



dotenv.config() //carga variables de entorno desde un archivo .env a process.env para que las puedas usar en tu código.

const app = express()
app.use(express.json())
  
export async function insertarCliente(newClient) {
  const { telegram_id, full_name, bot_activo, created_at } = newClient
  const { rows, errors, warnings } = await clientbp.createTableRows({
    table: 'UserTable',
    rows: [{
          telegram_id: usuario.telegram_id.toString(),
          full_name: usuario.full_name,
          bot_activo: usuario.bot_activo,
          //created_at: usuario.created_at
      }]
    })

}  

export async function actualizarCliente(clienteId, update) {

  //Buscamos en botpress el registro correspondiente al telegram_id.
  const { records } = await clientbp.listTableRecords({
    table: 'UserTable',
    query: {
      filters: [{ column: 'telegram_id', operator: 'equals', value: usuario.telegram_id.toString() }]
    }
  })
  //obtenemos el id de ese registro especifico.
  const recordId = records[0].id
  //Preparamos el nuevo contenido de la fila.
  const updateRow = {
    id: recordId,
    bot_activo:
      typeof nuevosDatos.bot_activo === 'boolean'
      ? nuevosDatos.bot_activo         // si es booleano → usalo
      : actual.bot_activo // si no → dejá el valor actual
    //created_at: nuevosDatos.created_at || actual.created_at       
  }
  //Actualizamos la tabla de botpress.
  const { rows, errors, warnings } = await client.updateTableRows({
    table: 'UserTable',
    rows: [
      {
        id: updateRow.id,
        bot_activo: updateRow.bot_activo,
      }
    ]
  })

}

// ⛔ Subir archivo CSV a Botpress
export async function subirArchivoABotpress(filePath) {
  const form = new FormData()
  form.append('file', fs.createReadStream(filePath))

  const response = await fetch(`${process.env.BOTPRESS_API_URL}/v1/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.BOTPRESS_ACCESS_TOKEN}`
    },
    body: form
  })

  const data = await response.json()
  if (!response.ok) throw new Error(`❌ Error al subir archivo: ${data.message}`)
  return data.file.id
}

// ⬇️ Importar CSV en tabla Botpress
export async function importarCSVEnBotpress(fileId) {
  const { job } = await clientbp.importTable({
    table: 'UserTable',
    fileId
  })
  console.log('📦 Import iniciado. Job ID:', job.id)
}
    
// Eliminar todos los registros y reemplazar con nuevos datos de Supabase
export async function reemplazarTabla() {
  const { deletedRows } = await clientbp.deleteTableRows({
    table: 'UserTable',
    deleteAllRows: true
  })

  console.log(`🧹 Tabla limpiada (${deletedRows?.length || 0} registros)`)

  const usuarios = await obtenerUsuariosRecientes()
  await exportarCSV(usuarios)
  const fileId = await subirArchivoABotpress('usuarios.csv')
  await importarCSVEnBotpress(fileId)
}
  
  
