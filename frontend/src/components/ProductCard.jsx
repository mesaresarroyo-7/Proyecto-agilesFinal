import { useCart } from '../context/CartContext';

export default function ProductCard({ producto }) {
  const { addItem, items } = useCart();

  const inCart = items.find(i => i.producto_id === producto.id);
  const cartQty = inCart ? inCart.cantidad : 0;
  const available = producto.stock - cartQty;
  const isLowStock = producto.stock <= producto.stock_minimo;

  const getStockClass = () => {
    if (producto.stock === 0) return 'stock-low';
    if (isLowStock) return 'stock-warning';
    return 'stock-ok';
  };

  return (
    <div className="product-card">
      <span className="product-category">{producto.categoria || 'General'}</span>
      <h3 className="product-name">{producto.nombre}</h3>
      <p className="product-code">📦 {producto.codigo_barras}</p>
      <div className="product-price">S/ {parseFloat(producto.precio).toFixed(2)}</div>
      <p className={`product-stock ${getStockClass()}`}>
        Stock: {producto.stock} unidades
        {isLowStock && producto.stock > 0 && ' ⚠️ Stock bajo'}
        {producto.stock === 0 && ' ❌ Sin stock'}
      </p>
      {cartQty > 0 && (
        <p style={{fontSize: '12px', color: '#3b82f6', marginBottom: '8px'}}>
          🛒 {cartQty} en carrito ({available} disponibles)
        </p>
      )}
      <div className="product-actions">
        <button
          className="btn btn-primary btn-sm"
          style={{width: '100%'}}
          onClick={() => addItem(producto)}
          disabled={available <= 0 || producto.estado === 'INACTIVO'}
        >
          {available <= 0 ? '❌ Sin disponibilidad' : '🛒 Agregar al Carrito'}
        </button>
      </div>
    </div>
  );
}
