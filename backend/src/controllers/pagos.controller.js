const { processPayment } = require('../services/payment.service');

/**
 * POST /api/pagos/validar
 * Endpoint auxiliar para validar un token de pago.
 */
const validarPago = async (req, res, next) => {
  try {
    const { token, amount } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token de pago requerido.' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto debe ser mayor a cero.' });
    }

    const result = await processPayment(token, amount);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { validarPago };
