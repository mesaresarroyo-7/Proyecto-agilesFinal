/**
 * Middleware de autorización por roles.
 * Uso: roleMiddleware('admin', 'vendedor')
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}.`,
        rol_actual: req.user.rol
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
