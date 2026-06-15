import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Compras() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [processing, setProcessing] = useState(false);

  const [proveedorId, setProveedorId] = useState('');
  const [itemsCompra, setItemsCompra] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [provRes, prodRes, comprasRes] = await Promise.all([
        api.get('/proveedores'),
        api.get('/productos'),
        api.get('/compras')
      ]);
      setProveedores(provRes.data);
      setProductos(prodRes.data);
      setHistorial(comprasRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const agregarItem = () => {
    if (!productoSeleccionado || !cantidad || !precioUnitario) {
      setMessage({ type: 'error', text: 'Complete todos los campos del item.' });
      return;
    }

    const producto = productos.find(p => p.id === parseInt(productoSeleccionado));
    if (!producto) return;

    setItemsCompra(prev => [...prev, {
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: parseInt(cantidad),
      precio_unitario: parseFloat(precioUnitario)
    }]);

    setProductoSeleccionado('');
    setCantidad('');
    setPrecioUnitario('');
    setMessage(null);
  };

  const quitarItem = (index) => {
    setItemsCompra(prev => prev.filter((_, i) => i !== index));
  };

  const subtotalCompra = itemsCompra.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  const igvCompra = parseFloat((subtotalCompra * 0.18).toFixed(2));
  const totalCompra = parseFloat((subtotalCompra + igvCompra).toFixed(2));

  const handleRegistrarCompra = async () => {
    if (!proveedorId) {
      setMessage({ type: 'error', text: 'Seleccione un proveedor.' });
      return;
    }
    if (itemsCompra.length === 0) {
      setMessage({ type: 'error', text: 'Agregue al menos un producto.' });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const payload = {
        proveedor_id: parseInt(proveedorId),
        items: itemsCompra.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }))
      };

      const res = await api.post('/compras', payload);
      
      setMessage({ type: 'success', text: `✅ Compra #${res.data.compra.id} registrada. Stock actualizado y Kardex registrado.` });
      setItemsCompra([]);
      setProveedorId('');
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al registrar compra.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Cargando datos...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h2>📦 Compras a Proveedores</h2>
        <p>Registre compras e ingrese stock al almacén</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      <div className="compra-layout">
        {/* Formulario de compra */}
        <div className="card">
          <h3 className="card-title" style={{marginBottom: '20px'}}>📝 Nueva Compra</h3>

          <div className="form-group">
            <label>Proveedor *</label>
            <select className="form-control" value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
              <option value="">Seleccione un proveedor</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.razon_social} (RUC: {p.ruc})</option>
              ))}
            </select>
          </div>

          <div style={{padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '16px'}}>
            <label style={{fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'block'}}>
              Agregar Producto a la Compra
            </label>
            <div className="form-row">
              <div className="form-group" style={{marginBottom: 0}}>
                <select className="form-control" value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)}>
                  <option value="">Producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <input type="number" min="1" className="form-control" placeholder="Cantidad"
                  value={cantidad} onChange={e => setCantidad(e.target.value)} />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <input type="number" step="0.01" min="0" className="form-control" placeholder="Precio unit."
                  value={precioUnitario} onChange={e => setPrecioUnitario(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{marginTop: '12px'}} onClick={agregarItem}>
              ➕ Agregar Item
            </button>
          </div>

          {/* Items de la compra */}
          {itemsCompra.length > 0 && (
            <div className="compra-items-list">
              {itemsCompra.map((item, idx) => (
                <div key={idx} className="compra-item">
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 600, fontSize: '14px'}}>{item.nombre}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>
                      {item.cantidad} × S/ {item.precio_unitario.toFixed(2)} = S/ {(item.cantidad * item.precio_unitario).toFixed(2)}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => quitarItem(idx)}>✕</button>
                </div>
              ))}
              
              <div className="cart-totals" style={{marginTop: '12px'}}>
                <div className="total-row"><span>Subtotal</span><span>S/ {subtotalCompra.toFixed(2)}</span></div>
                <div className="total-row"><span>IGV (18%)</span><span>S/ {igvCompra.toFixed(2)}</span></div>
                <div className="total-row grand-total"><span>Total</span><span>S/ {totalCompra.toFixed(2)}</span></div>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{width: '100%', marginTop: '16px'}}
            onClick={handleRegistrarCompra}
            disabled={processing || itemsCompra.length === 0}
          >
            {processing ? '⏳ Registrando...' : '📦 Registrar Compra'}
          </button>
        </div>

        {/* Historial de compras */}
        <div className="card">
          <h3 className="card-title" style={{marginBottom: '20px'}}>🕐 Historial de Compras</h3>
          
          {historial.length === 0 ? (
            <div className="empty-state" style={{padding: '30px'}}>
              <div className="empty-icon">📦</div>
              <h3>Sin compras registradas</h3>
            </div>
          ) : (
            <div className="table-container" style={{border: 'none'}}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Proveedor</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(c => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td style={{fontSize: '13px'}}>{c.proveedor_nombre}</td>
                      <td style={{fontWeight: 700}}>S/ {parseFloat(c.total).toFixed(2)}</td>
                      <td style={{fontSize: '12px'}}>{new Date(c.fecha_compra).toLocaleString('es-PE')}</td>
                      <td><span className="badge badge-success">{c.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
