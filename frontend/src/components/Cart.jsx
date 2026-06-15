import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, count, subtotal, igv, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-summary">
        <h3 className="card-title" style={{marginBottom: '16px'}}>🛒 Carrito de Compras</h3>
        <div className="empty-state" style={{padding: '30px'}}>
          <div className="empty-icon">🛒</div>
          <h3>Carrito vacío</h3>
          <p>Agrega productos desde la sección de ventas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-summary">
      <h3 className="card-title" style={{marginBottom: '16px'}}>
        🛒 Carrito de Compras ({count} {count === 1 ? 'producto' : 'productos'})
      </h3>
      
      <div>
        {items.map(item => (
          <div key={item.producto_id} className="cart-item">
            <div className="cart-item-info">
              <div className="cart-item-name">{item.nombre}</div>
              <div className="cart-item-price">
                S/ {item.precio.toFixed(2)} c/u → S/ {(item.precio * item.cantidad).toFixed(2)}
              </div>
            </div>
            <div className="cart-quantity">
              <button onClick={() => updateQuantity(item.producto_id, item.cantidad - 1)}>−</button>
              <span>{item.cantidad}</span>
              <button 
                onClick={() => updateQuantity(item.producto_id, item.cantidad + 1)}
                disabled={item.cantidad >= item.stock}
              >+</button>
            </div>
            <button 
              className="btn btn-danger btn-icon btn-sm"
              onClick={() => removeItem(item.producto_id)}
              title="Eliminar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

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
          <span>Total</span>
          <span>S/ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
