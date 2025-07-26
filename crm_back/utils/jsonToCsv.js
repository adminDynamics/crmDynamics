import { Parser } from 'json2csv'
import fs from 'fs'

/**
 * Exporta un array de objetos JSON a un archivo CSV
 * @param {Array<Object>} data - Array de objetos (ej: usuarios)
 * @param {string} filePath - Ruta del archivo a generar (por defecto 'usuarios.csv')
 */
export const exportarCSV = (data, filePath = 'usuarios.csv') => {
  try {
    const parser = new Parser()
    const csv = parser.parse(data)
    fs.writeFileSync(filePath, csv)
    console.log(`📁 CSV exportado correctamente a ${filePath}`)
  } catch (err) {
    console.error('❌ Error al exportar CSV:', err)
  }
}