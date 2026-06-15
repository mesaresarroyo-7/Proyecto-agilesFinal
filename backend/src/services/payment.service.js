/**
 * Servicio de pago sandbox/mock.
 * 
 * Simula una pasarela de pago para exposición académica.
 * Preparado para reemplazar por integración real con Culqi, Stripe, etc.
 * 
 * Tokens reconocidos:
 * - tok_test_aprobado  -> pago aprobado
 * - tok_test_rechazado -> pago rechazado
 * - cualquier otro     -> token inválido
 */

/**
 * Genera una referencia de pago única.
 */
function generatePaymentReference() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

/**
 * Procesa un pago sandbox/mock.
 * @param {string} token - Token de pago sandbox
 * @param {number} amount - Monto total a cobrar
 * @returns {Object} Resultado del pago
 */
async function processPayment(token, amount) {
  // Simular latencia de pasarela real (300-800ms)
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  if (!token || typeof token !== 'string') {
    return {
      approved: false,
      status: 'ERROR',
      reference: null,
      message: 'Token de pago no proporcionado.'
    };
  }

  if (amount <= 0) {
    return {
      approved: false,
      status: 'ERROR',
      reference: null,
      message: 'El monto debe ser mayor a cero.'
    };
  }

  switch (token) {
    case 'tok_test_aprobado':
      return {
        approved: true,
        status: 'APPROVED',
        reference: generatePaymentReference(),
        message: 'Pago sandbox aprobado'
      };

    case 'tok_test_rechazado':
      return {
        approved: false,
        status: 'REJECTED',
        reference: null,
        message: 'Pago sandbox rechazado'
      };

    default:
      return {
        approved: false,
        status: 'ERROR',
        reference: null,
        message: `Token inválido: "${token}". Use tok_test_aprobado o tok_test_rechazado.`
      };
  }
}

module.exports = { processPayment };
