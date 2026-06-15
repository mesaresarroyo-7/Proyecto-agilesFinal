import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import { useCart } from '../context/CartContext';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { count } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchProductos(); }, []);

  const fetchProductos = async () => {
    try {
      const res = await api.get('/productos?estado=ACTIVO');
      setProductos(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo_barras.includes(search)
  );

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Cargando productos...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h2>🛒 Ventas</h2>
        <p>Seleccione productos para agregar al carrito</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px'}}>
        {/* Productos */}
        <div>
          <div style={{display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center'}}>
            <div className="search-bar" style={{flex: 1, marginBottom: 0}}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar producto por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-success" onClick={() => navigate('/pago')} disabled={count === 0}>
              💳 Ir a Pagar ({count})
            </button>
          </div>

          <div className="product-grid">
            {filtered.map(producto => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No se encontraron productos</h3>
              <p>Intente con otro término de búsqueda</p>
            </div>
          )}
        </div>

        {/* Carrito lateral */}
        <div style={{position: 'sticky', top: '24px', alignSelf: 'start'}}>
          <Cart />
          {count > 0 && (
            <button 
              className="btn btn-success btn-lg" 
              style={{width: '100%', marginTop: '16px'}}
              onClick={() => navigate('/pago')}
            >
              💳 Proceder al Pago
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
