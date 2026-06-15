const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * POST /api/auth/login
 * Autenticación de usuario con email y password.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    // Buscar usuario en PostgreSQL
    const result = await pool.query(
      'SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const usuario = result.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador.' });
    }

    // Comparar contraseña con bcrypt
    const passwordValid = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/perfil
 * Obtener perfil del usuario autenticado.
 */
const getPerfil = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getPerfil };
