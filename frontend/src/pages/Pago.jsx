import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import Ticket from '../components/Ticket';

export default function Pago() {
  const { items, count, subtotal, igv, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');
  const [selectedToken, setSelectedToken] = useState('tok_test_aprobado');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardName, setCardName] = useState('USUARIO PRUEBA');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [comprobante, setComprobante] = useState(null);

  const handlePagar = async () => {
    if (items.length === 0) {
      setError('El carrito está vacío.');
      return;
    }

    setError('');
    setProcessing(true);

    try {
      const payload = {
        tipo_comprobante: tipoComprobante,
        payment_token: selectedToken,
        items: items.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad
        }))
      };

      const response = await api.post('/ventas/procesar', payload);
      
      setComprobante(response.data.comprobante);
      clearCart();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.payment_message || 'Error al procesar la venta.';
      setError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  // Si ya se procesó la venta, mostrar ticket
  if (comprobante) {
    return (
      <div>
        <div className="page-header">
          <h2>✅ Venta Procesada</h2>
          <p>El pago se realizó exitosamente</p>
        </div>
        <div className="alert alert-success">
          ✅ La venta fue procesada y registrada correctamente. El stock se actualizó y el movimiento quedó registrado en el Kardex.
        </div>
        <Ticket comprobante={comprobante} />
        <div style={{textAlign: 'center', marginTop: '24px'}}>
          <button className="btn btn-primary btn-lg" onClick={() => { setComprobante(null); navigate('/ventas'); }}>
            🛒 Realizar otra venta
          </button>
        </div>
      </div>
    );
  }

  // Si el carrito está vacío
  if (count === 0) {
    return (
      <div>
        <div className="page-header">
          <h2>💳 Pago</h2>
          <p>Procese el pago de su compra</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Carrito vacío</h3>
          <p>Agregue productos desde la sección de ventas</p>
          <button className="btn btn-primary" style={{marginTop: '16px'}} onClick={() => navigate('/ventas')}>
            🛒 Ir a Ventas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>💳 Pago</h2>
        <p>Complete el pago para procesar la venta</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="payment-layout">
        {/* Formulario de pago */}
        <div className="payment-form">
          <h3 className="card-title" style={{marginBottom: '20px'}}>Datos de Pago</h3>

          {/* Tarjeta visual */}
          <div className="card-visual">
            <div className="card-chip"></div>
            <div className="card-brand">VISA</div>
            <div className="card-number">{cardNumber}</div>
            <div className="card-bottom">
              <div>
                <div className="card-label">Titular</div>
                <div className="card-value">{cardName}</div>
              </div>
              <div>
                <div className="card-label">Vence</div>
                <div className="card-value">{cardExpiry}</div>
              </div>
            </div>
          </div>

          {/* Campos de tarjeta (simulados) */}
          <div className="form-group">
            <label>Número de Tarjeta (simulado)</label>
            <input className="form-control" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Nombre del Titular</label>
            <input className="form-control" value={cardName} onChange={e => setCardName(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Vencimiento</label>
              <input className="form-control" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input className="form-control" type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} />
            </div>
          </div>

          {/* Selector de token sandbox */}
          <div className="form-group">
            <label>Token de Pago Sandbox</label>
            <div className="token-selector">
              <div
                className={`token-option ${selectedToken === 'tok_test_aprobado' ? 'selected' : ''}`}
                onClick={() => setSelectedToken('tok_test_aprobado')}
              >
                <span className="token-label">✅ Aprobar Pago</span>
                <span className="token-value">tok_test_aprobado</span>
              </div>
              <div
                className={`token-option ${selectedToken === 'tok_test_rechazado' ? 'selected' : ''}`}
                onClick={() => setSelectedToken('tok_test_rechazado')}
              >
                <span className="token-label">❌ Rechazar Pago</span>
                <span className="token-value">tok_test_rechazado</span>
              </div>
            </div>
          </div>

          {/* Tipo de comprobante */}
          <div className="form-group">
            <label>Tipo de Comprobante</label>
            <select className="form-control" value={tipoComprobante} onChange={e => setTipoComprobante(e.target.value)}>
              <option value="BOLETA">Boleta</option>
              <option value="FACTURA">Factura</option>
            </select>
          </div>

          <button
            className="btn btn-success btn-lg"
            style={{width: '100%', marginTop: '8px'}}
            onClick={handlePagar}
            disabled={processing}
          >
            {processing ? '⏳ Procesando pago...' : `💳 Pagar S/ ${total.toFixed(2)}`}
          </button>

          <p style={{fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '12px'}}>
            🔒 Los datos de tarjeta son simulados y NO se almacenan en la base de datos.
            Solo se envía el token sandbox al servidor.
          </p>
        </div>

        {/* Resumen del carrito */}
        <div>
          <div className="cart-summary">
            <h3 className="card-title" style={{marginBottom: '16px'}}>📝 Resumen de Compra</h3>
            
            {items.map(item => (
              <div key={item.producto_id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.nombre}</div>
                  <div className="cart-item-price">{item.cantidad} × S/ {item.precio.toFixed(2)}</div>
                </div>
                <div style={{fontWeight: 700, fontSize: '14px'}}>
                  S/ {(item.precio * item.cantidad).toFixed(2)}
                </div>
              </div>
            ))}

            <div className="cart-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>IGV (18%)</span>
                <span>S/ {igv.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>TOTAL</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
