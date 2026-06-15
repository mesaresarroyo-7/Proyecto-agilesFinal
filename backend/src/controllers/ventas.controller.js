const pool = require('../config/db');
const { processPayment } = require('../services/payment.service');
const { generarNumeroComprobante } = require('../utils/comprobante');

/**
 * POST /api/ventas/procesar
 * Procesa una venta completa con validación de pago sandbox,
 * transacción PostgreSQL, actualización de stock, Kardex y comprobante.
 */
const procesarVenta = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { tipo_comprobante, payment_token, items } = req.body;
    const usuario_id = req.user.id;

    // Validaciones iniciales
    if (!tipo_comprobante || !['BOLETA', 'FACTURA'].includes(tipo_comprobante)) {
      return res.status(400).json({ error: 'tipo_comprobante debe ser BOLETA o FACTURA.' });
    }
    if (!payment_token) {
      return res.status(400).json({ error: 'payment_token es requerido.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no puede estar vacío.' });
    }

    // Obtener precios y stock actual desde PostgreSQL
    let subtotalVenta = 0;
    const detalles = [];

    for (const item of items) {
      if (!item.producto_id || !item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({ error: 'Cada item debe tener producto_id y cantidad válida.' });
      }

      const prodResult = await pool.query(
        "SELECT id, nombre, codigo_barras, precio, stock FROM productos WHERE id = $1 AND estado = 'ACTIVO'",
        [item.producto_id]
      );

      if (prodResult.rows.length === 0) {
        return res.status(404).json({ error: `Producto con id ${item.producto_id} no encontrado o inactivo.` });
      }

      const producto = prodResult.rows[0];

      if (item.cantidad > producto.stock) {
        return res.status(400).json({
          error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, solicitado: ${item.cantidad}.`
        });
      }

      const subtotalItem = parseFloat((item.cantidad * parseFloat(producto.precio)).toFixed(2));
      subtotalVenta += subtotalItem;

      detalles.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        codigo_barras: producto.codigo_barras,
        cantidad: item.cantidad,
        precio_unitario: parseFloat(producto.precio),
        subtotal: subtotalItem,
        stock_actual: producto.stock
      });
    }

    // Calcular IGV y total
    subtotalVenta = parseFloat(subtotalVenta.toFixed(2));
    const igv = parseFloat((subtotalVenta * 0.18).toFixed(2));
    const total = parseFloat((subtotalVenta + igv).toFixed(2));

    // Validar pago con servicio sandbox ANTES de iniciar transacción
    const paymentResult = await processPayment(payment_token, total);

    if (!paymentResult.approved) {
      return res.status(402).json({
        error: 'Pago no aprobado.',
        payment_status: paymentResult.status,
        payment_message: paymentResult.message
      });
    }

    // Pago aprobado - Iniciar transacción PostgreSQL
    await client.query('BEGIN');

    try {
      // Generar número de comprobante
      const numero_comprobante = await generarNumeroComprobante(tipo_comprobante, client);

      // Insertar cabecera de venta
      const ventaResult = await client.query(
        `INSERT INTO ventas (usuario_id, tipo_comprobante, numero_comprobante, subtotal, igv, total, payment_token, payment_status, payment_reference, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'COMPLETADA')
         RETURNING *`,
        [usuario_id, tipo_comprobante, numero_comprobante, subtotalVenta, igv, total,
         payment_token, paymentResult.status, paymentResult.reference]
      );
      const venta_id = ventaResult.rows[0].id;

      // Insertar detalles, descontar stock y registrar kardex
      for (const detalle of detalles) {
        // Insertar detalle de venta
        await client.query(
          `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [venta_id, detalle.producto_id, detalle.cantidad, detalle.precio_unitario, detalle.subtotal]
        );

        const stockAnterior = detalle.stock_actual;
        const stockNuevo = stockAnterior - detalle.cantidad;

        // Descontar stock
        await client.query(
          'UPDATE productos SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [stockNuevo, detalle.producto_id]
        );

        // Registrar Kardex - SALIDA por VENTA
        await client.query(
          `INSERT INTO kardex (producto_id, tipo_movimiento, origen, referencia_id, cantidad, stock_anterior, stock_nuevo, descripcion, usuario_id)
           VALUES ($1, 'SALIDA', 'VENTA', $2, $3, $4, $5, $6, $7)`,
          [detalle.producto_id, venta_id, detalle.cantidad, stockAnterior, stockNuevo,
           `Venta #${venta_id} - ${detalle.nombre}`, usuario_id]
        );
      }

      // Insertar comprobante
      await client.query(
        `INSERT INTO comprobantes (venta_id, tipo_comprobante, numero_comprobante, subtotal, igv, total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [venta_id, tipo_comprobante, numero_comprobante, subtotalVenta, igv, total]
      );

      await client.query('COMMIT');

      // Respuesta exitosa
      res.status(201).json({
        message: 'Venta procesada correctamente',
        venta_id,
        comprobante: {
          tipo_comprobante,
          numero_comprobante,
          subtotal: subtotalVenta,
          igv,
          total,
          payment_status: paymentResult.status,
          payment_reference: paymentResult.reference,
          fecha: ventaResult.rows[0].fecha_venta,
          items: detalles.map(d => ({
            producto_id: d.producto_id,
            nombre: d.nombre,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            subtotal: d.subtotal
          }))
        }
      });
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    }
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};

/**
 * GET /api/ventas
 * Listar todas las ventas.
 */
const getVentas = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.nombre AS usuario_nombre
       FROM ventas v
       JOIN usuarios u ON u.id = v.usuario_id
       ORDER BY v.fecha_venta DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ventas/:id
 * Obtener detalle de una venta específica.
 */
const getVentaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ventaResult = await pool.query(
      `SELECT v.*, u.nombre AS usuario_nombre
       FROM ventas v
       JOIN usuarios u ON u.id = v.usuario_id
       WHERE v.id = $1`,
      [id]
    );

    if (ventaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada.' });
    }

    const detallesResult = await pool.query(
      `SELECT dv.*, p.nombre AS producto_nombre, p.codigo_barras
       FROM detalle_ventas dv
       JOIN productos p ON p.id = dv.producto_id
       WHERE dv.venta_id = $1`,
      [id]
    );

    const comprobanteResult = await pool.query(
      'SELECT * FROM comprobantes WHERE venta_id = $1',
      [id]
    );

    res.json({
      ...ventaResult.rows[0],
      detalles: detallesResult.rows,
      comprobante: comprobanteResult.rows[0] || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ventas/kardex/movimientos
 * Obtener historial de Kardex.
 */
const getKardex = async (req, res, next) => {
  try {
    const { producto_id } = req.query;
    let query = `
      SELECT k.*, p.nombre AS producto_nombre, p.codigo_barras, u.nombre AS usuario_nombre
      FROM kardex k
      JOIN productos p ON p.id = k.producto_id
      JOIN usuarios u ON u.id = k.usuario_id
    `;
    const params = [];

    if (producto_id) {
      query += ' WHERE k.producto_id = $1';
      params.push(producto_id);
    }

    query += ' ORDER BY k.fecha_movimiento DESC LIMIT 200';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

module.exports = { procesarVenta, getVentas, getVentaById, getKardex };
