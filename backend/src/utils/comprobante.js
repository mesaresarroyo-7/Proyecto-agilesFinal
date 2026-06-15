/**
 * Utilidad para generar números de comprobante.
 */

const pool = require('../config/db');

/**
 * Genera el próximo número de comprobante según el tipo.
 * Formato: B001-000001 (boleta) o F001-000001 (factura)
 * @param {string} tipo - 'BOLETA' o 'FACTURA'
 * @returns {string} Número de comprobante generado
 */
async function generarNumeroComprobante(tipo, client = null) {
  const db = client || pool;
  const prefix = tipo === 'BOLETA' ? 'B001' : 'F001';
  
  const result = await db.query(
    `SELECT numero_comprobante FROM ventas 
     WHERE tipo_comprobante = $1 
     ORDER BY id DESC LIMIT 1`,
    [tipo]
  );

  let nextNumber = 1;

  if (result.rows.length > 0) {
    const lastNumber = result.rows[0].numero_comprobante;
    const parts = lastNumber.split('-');
    if (parts.length === 2) {
      nextNumber = parseInt(parts[1], 10) + 1;
    }
  }

  return `${prefix}-${nextNumber.toString().padStart(6, '0')}`;
}

module.exports = { generarNumeroComprobante };
