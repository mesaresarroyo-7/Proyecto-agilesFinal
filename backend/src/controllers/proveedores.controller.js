const pool = require('../config/db');

/**
 * GET /api/proveedores
 */
const getProveedores = async (req, res, next) => {
  try {
    const { buscar } = req.query;
    let query = 'SELECT * FROM proveedores WHERE activo = true';
    const params = [];

    if (buscar) {
      query += ' AND (LOWER(razon_social) LIKE LOWER($1) OR ruc LIKE $1)';
      params.push(`%${buscar}%`);
    }

    query += ' ORDER BY razon_social ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/proveedores/:id
 */
const getProveedorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM proveedores WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/proveedores
 */
const createProveedor = async (req, res, next) => {
  try {
    const { ruc, razon_social, telefono, email, direccion } = req.body;

    if (!ruc || !razon_social) {
      return res.status(400).json({ error: 'RUC y razón social son requeridos.' });
    }

    const result = await pool.query(
      `INSERT INTO proveedores (ruc, razon_social, telefono, email, direccion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [ruc, razon_social, telefono || null, email || null, direccion || null]
    );

    res.status(201).json({
      message: 'Proveedor creado exitosamente.',
      proveedor: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/proveedores/:id
 */
const updateProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ruc, razon_social, telefono, email, direccion } = req.body;

    const result = await pool.query(
      `UPDATE proveedores SET
        ruc = COALESCE($1, ruc),
        razon_social = COALESCE($2, razon_social),
        telefono = COALESCE($3, telefono),
        email = COALESCE($4, email),
        direccion = COALESCE($5, direccion),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [ruc, razon_social, telefono, email, direccion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }

    res.json({
      message: 'Proveedor actualizado exitosamente.',
      proveedor: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/proveedores/:id
 */
const deleteProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE proveedores SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }

    res.json({
      message: 'Proveedor eliminado (desactivado) exitosamente.',
      proveedor: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProveedores, getProveedorById, createProveedor, updateProveedor, deleteProveedor };
