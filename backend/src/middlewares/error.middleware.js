/**
 * Middleware global de manejo de errores.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  // Error de validación de PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Registro duplicado. Ya existe un registro con esos datos.',
      detalle: err.detail
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Error de referencia. El registro referenciado no existe.',
      detalle: err.detail
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      error: 'Error de validación. Los datos no cumplen las restricciones.',
      detalle: err.detail
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
