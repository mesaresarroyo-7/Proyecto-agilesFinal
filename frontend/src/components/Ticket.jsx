export default function Ticket({ comprobante }) {
  if (!comprobante) return null;

  const fecha = comprobante.fecha 
    ? new Date(comprobante.fecha).toLocaleString('es-PE')
    : new Date().toLocaleString('es-PE');

  return (
    <div className="ticket">
      <div className="ticket-header">
        <h3>DollarCity</h3>
        <p>Sede Santa Anita</p>
        <p>RUC: 20123456789</p>
        <p>Av. Santa Anita 123, Lima</p>
      </div>

      <div className="ticket-info">
        <div className="info-row">
          <span className="label">Comprobante:</span>
          <span className="value">{comprobante.tipo_comprobante}</span>
        </div>
        <div className="info-row">
          <span className="label">Número:</span>
          <span className="value">{comprobante.numero_comprobante}</span>
        </div>
        <div className="info-row">
          <span className="label">Fecha:</span>
          <span className="value">{fecha}</span>
        </div>
        <div className="info-row">
          <span className="label">Estado Pago:</span>
          <span className="value" style={{color: comprobante.payment_status === 'APPROVED' ? '#16a34a' : '#dc2626'}}>
            {comprobante.payment_status === 'APPROVED' ? '✅ Aprobado' : '❌ ' + comprobante.payment_status}
          </span>
        </div>
        {comprobante.payment_reference && (
          <div className="info-row">
            <span className="label">Ref. Pago:</span>
            <span className="value" style={{fontFamily: 'monospace', fontSize: '12px'}}>
              {comprobante.payment_reference}
            </span>
          </div>
        )}
      </div>

      <div className="ticket-items">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style={{textAlign: 'center'}}>Cant.</th>
              <th style={{textAlign: 'right'}}>P.Unit.</th>
              <th style={{textAlign: 'right'}}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {comprobante.items && comprobante.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.nombre}</td>
                <td style={{textAlign: 'center'}}>{item.cantidad}</td>
                <td style={{textAlign: 'right'}}>S/ {parseFloat(item.precio_unitario).toFixed(2)}</td>
                <td style={{textAlign: 'right'}}>S/ {parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ticket-totals">
        <div className="total-row">
          <span>Subtotal</span>
          <span>S/ {parseFloat(comprobante.subtotal).toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>IGV (18%)</span>
          <span>S/ {parseFloat(comprobante.igv).toFixed(2)}</span>
        </div>
        <div className="total-row grand-total">
          <span>TOTAL</span>
          <span>S/ {parseFloat(comprobante.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="ticket-footer">
        <div className="payment-badge">
          ✅ Pago Procesado Exitosamente
        </div>
        <p style={{marginTop: '12px'}}>¡Gracias por su compra!</p>
        <p>DollarCity - Todo a precios increíbles</p>
      </div>
    </div>
  );
}
