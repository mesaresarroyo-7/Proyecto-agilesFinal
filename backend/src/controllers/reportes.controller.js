const pool = require('../config/db');

/**
 * GET /api/reportes/productos-mas-vendidos
 * Reporte de productos más vendidos con totales agregados.
 */
const productosMasVendidos = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.codigo_barras,
        p.categoria,
        p.precio AS precio_actual,
        p.stock AS stock_actual,
        SUM(dv.cantidad) AS total_vendido,
        SUM(dv.subtotal) AS total_ingresos,
        COUNT(dv.id) AS veces_vendido
      FROM detalle_ventas dv
      JOIN productos p ON p.id = dv.producto_id
      JOIN ventas v ON v.id = dv.venta_id
      WHERE v.estado = 'COMPLETADA'
      GROUP BY p.id, p.nombre, p.codigo_barras, p.categoria, p.precio, p.stock
      ORDER BY total_vendido DESC
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reportes/resumen-dashboard
 * Datos agregados para el dashboard administrativo.
 */
const resumenDashboard = async (req, res, next) => {
  try {
    // Total de ventas completadas
    const ventasResult = await pool.query(
      "SELECT COUNT(*) AS total_ventas, COALESCE(SUM(total), 0) AS ingresos_totales FROM ventas WHERE estado = 'COMPLETADA'"
    );

    // Total de compras
    const comprasResult = await pool.query(
      "SELECT COUNT(*) AS total_compras, COALESCE(SUM(total), 0) AS gastos_totales FROM compras WHERE estado = 'COMPLETADA'"
    );

    // Productos activos
    const productosResult = await pool.query(
      "SELECT COUNT(*) AS total_productos FROM productos WHERE estado = 'ACTIVO'"
    );

    // Productos con stock bajo
    const stockBajoResult = await pool.query(
      "SELECT COUNT(*) AS productos_stock_bajo FROM productos WHERE stock <= stock_minimo AND estado = 'ACTIVO'"
    );

    // Proveedores activos
    const proveedoresResult = await pool.query(
      'SELECT COUNT(*) AS total_proveedores FROM proveedores WHERE activo = true'
    );

    // Ventas del día
    const ventasHoyResult = await pool.query(
      "SELECT COUNT(*) AS ventas_hoy, COALESCE(SUM(total), 0) AS ingresos_hoy FROM ventas WHERE estado = 'COMPLETADA' AND DATE(fecha_venta) = CURRENT_DATE"
    );

    // Últimas 5 ventas
    const ultimasVentasResult = await pool.query(
      `SELECT v.id, v.numero_comprobante, v.tipo_comprobante, v.total, v.fecha_venta, u.nombre AS vendedor
       FROM ventas v
       JOIN usuarios u ON u.id = v.usuario_id
       WHERE v.estado = 'COMPLETADA'
       ORDER BY v.fecha_venta DESC LIMIT 5`
    );

    // Productos con stock bajo (detalle)
    const stockBajoDetalle = await pool.query(
      `SELECT id, nombre, codigo_barras, stock, stock_minimo 
       FROM productos 
       WHERE stock <= stock_minimo AND estado = 'ACTIVO' 
       ORDER BY stock ASC LIMIT 10`
    );

    res.json({
      ventas: {
        total: parseInt(ventasResult.rows[0].total_ventas),
        ingresos: parseFloat(ventasResult.rows[0].ingresos_totales)
      },
      compras: {
        total: parseInt(comprasResult.rows[0].total_compras),
        gastos: parseFloat(comprasResult.rows[0].gastos_totales)
      },
      productos: {
        total: parseInt(productosResult.rows[0].total_productos),
        stock_bajo: parseInt(stockBajoResult.rows[0].productos_stock_bajo)
      },
      proveedores: {
        total: parseInt(proveedoresResult.rows[0].total_proveedores)
      },
      hoy: {
        ventas: parseInt(ventasHoyResult.rows[0].ventas_hoy),
        ingresos: parseFloat(ventasHoyResult.rows[0].ingresos_hoy)
      },
      ultimas_ventas: ultimasVentasResult.rows,
      alertas_stock: stockBajoDetalle.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { productosMasVendidos, resumenDashboard };
