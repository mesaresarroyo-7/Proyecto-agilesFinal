const pool = require('../config/db');

/**
 * GET /api/productos
 * Listar todos los productos activos. Soporta búsqueda por nombre o código.
 */
const getProductos = async (req, res, next) => {
  try {
    const { buscar, categoria, estado } = req.query;
    let query = 'SELECT * FROM productos WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (buscar) {
      query += ` AND (LOWER(nombre) LIKE LOWER($${paramIndex}) OR codigo_barras LIKE $${paramIndex})`;
      params.push(`%${buscar}%`);
      paramIndex++;
    }

    if (categoria) {
      query += ` AND categoria = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    if (estado) {
      query += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    query += ' ORDER BY nombre ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/productos/:id
 */
const getProductoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/productos
 */
const createProducto = async (req, res, next) => {
  try {
    const { codigo_barras, nombre, descripcion, categoria, precio, stock, stock_minimo, imagen_url } = req.body;

    if (!codigo_barras || !nombre || precio === undefined) {
      return res.status(400).json({ error: 'Código de barras, nombre y precio son requeridos.' });
    }

    if (precio < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo.' });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: 'El stock no puede ser negativo.' });
    }

    const result = await pool.query(
      `INSERT INTO productos (codigo_barras, nombre, descripcion, categoria, precio, stock, stock_minimo, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [codigo_barras, nombre, descripcion || null, categoria || null, precio, stock || 0, stock_minimo || 5, imagen_url || null]
    );

    res.status(201).json({
      message: 'Producto creado exitosamente.',
      producto: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/productos/:id
 */
const updateProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { codigo_barras, nombre, descripcion, categoria, precio, stock, stock_minimo, estado, imagen_url } = req.body;

    if (precio !== undefined && precio < 0) {
      return res.status(400).json({ error: 'El precio no puede ser negativo.' });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: 'El stock no puede ser negativo.' });
    }

    const result = await pool.query(
      `UPDATE productos SET
        codigo_barras = COALESCE($1, codigo_barras),
        nombre = COALESCE($2, nombre),
        descripcion = COALESCE($3, descripcion),
        categoria = COALESCE($4, categoria),
        precio = COALESCE($5, precio),
        stock = COALESCE($6, stock),
        stock_minimo = COALESCE($7, stock_minimo),
        estado = COALESCE($8, estado),
        imagen_url = COALESCE($9, imagen_url),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [codigo_barras, nombre, descripcion, categoria, precio, stock, stock_minimo, estado, imagen_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({
      message: 'Producto actualizado exitosamente.',
      producto: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/productos/:id
 * Eliminación lógica (cambia estado a INACTIVO).
 */
const deleteProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE productos SET estado = 'INACTIVO', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({
      message: 'Producto eliminado (desactivado) exitosamente.',
      producto: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/productos/categorias/lista
 * Obtiene la lista de categorías únicas.
 */
const getCategorias = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL ORDER BY categoria'
    );
    res.json(result.rows.map(r => r.categoria));
  } catch (error) {
    next(error);
  }
};

module.exports = { getProductos, getProductoById, createProducto, updateProducto, deleteProducto, getCategorias };
