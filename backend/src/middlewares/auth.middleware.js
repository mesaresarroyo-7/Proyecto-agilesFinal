const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      nombre: decoded.nombre
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Inicie sesión nuevamente.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    return res.status(500).json({ error: 'Error de autenticación.' });
  }
};

module.exports = authMiddleware;
