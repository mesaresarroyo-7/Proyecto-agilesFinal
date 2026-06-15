import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Almacen() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [kardex, setKardex] = useState([]);
  const [showKardex, setShowKardex] = useState(false);
  const [kardexProducto, setKardexProducto] = useState(null);

  const [form, setForm] = useState({
    codigo_barras: '', nombre: '', descripcion: '', categoria: '',
    precio: '', stock: '', stock_minimo: '5'
  });

  useEffect(() => { fetchProductos(); }, []);

  const fetchProductos = async () => {
    try {
      const res = await api.get('/productos');
      setProductos(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingProduct) {
        await api.put(`/productos/${editingProduct.id}`, form);
        setMessage({ type: 'success', text: 'Producto actualizado exitosamente.' });
      } else {
        await api.post('/productos', form);
        setMessage({ type: 'success', text: 'Producto creado exitosamente.' });
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProductos();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al guardar producto.' });
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setForm({
      codigo_barras: producto.codigo_barras,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria || '',
      precio: producto.precio,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de desactivar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      setMessage({ type: 'success', text: 'Producto desactivado.' });
      fetchProductos();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al eliminar.' });
    }
  };

  const handleVerKardex = async (producto) => {
    try {
      const res = await api.get(`/ventas/kardex/movimientos?producto_id=${producto.id}`);
      setKardex(res.data);
      setKardexProducto(producto);
      setShowKardex(true);
    } catch (err) {
      console.error('Error cargando kardex:', err);
    }
  };

  const resetForm = () => {
    setForm({ codigo_barras: '', nombre: '', descripcion: '', categoria: '', precio: '', stock: '', stock_minimo: '5' });
  };

  const openNewModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo_barras.includes(search)
  );

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Cargando productos...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h2>🏪 Almacén</h2>
        <p>Gestión de inventario y productos</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      <div style={{display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center'}}>
        <div className="search-bar" style={{flex: 1, marginBottom: 0}}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
          ➕ Nuevo Producto
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{fontFamily: 'monospace', fontSize: '12px'}}>{p.codigo_barras}</td>
                <td style={{fontWeight: 600}}>{p.nombre}</td>
                <td><span className="badge badge-info">{p.categoria || 'General'}</span></td>
                <td style={{fontWeight: 700}}>S/ {parseFloat(p.precio).toFixed(2)}</td>
                <td>
                  <span className={p.stock <= p.stock_minimo ? (p.stock === 0 ? 'stock-low' : 'stock-warning') : 'stock-ok'}>
                    {p.stock}
                    {p.stock <= p.stock_minimo && p.stock > 0 && ' ⚠️'}
                    {p.stock === 0 && ' ❌'}
                  </span>
                </td>
                <td>{p.stock_minimo}</td>
                <td>
                  <span className={`badge ${p.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}`}>
                    {p.estado}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(p)} title="Editar">✏️</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleVerKardex(p)} title="Kardex">📋</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)} title="Desactivar">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Producto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Código de Barras *</label>
                  <input className="form-control" value={form.codigo_barras}
                    onChange={e => setForm({...form, codigo_barras: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <input className="form-control" value={form.categoria}
                    onChange={e => setForm({...form, categoria: e.target.value})} placeholder="Ej: Higiene Personal" />
                </div>
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input className="form-control" value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input className="form-control" value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio (S/) *</label>
                  <input type="number" step="0.01" min="0" className="form-control" value={form.precio}
                    onChange={e => setForm({...form, precio: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" min="0" className="form-control" value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Stock Mínimo</label>
                  <input type="number" min="0" className="form-control" value={form.stock_minimo}
                    onChange={e => setForm({...form, stock_minimo: e.target.value})} />
                </div>
              </div>
              <div className="btn-group" style={{justifyContent: 'flex-end', marginTop: '8px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? '💾 Actualizar' : '➕ Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Kardex */}
      {showKardex && (
        <div className="modal-overlay" onClick={() => setShowKardex(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: '800px'}}>
            <div className="modal-header">
              <h3>📋 Kardex - {kardexProducto?.nombre}</h3>
              <button className="modal-close" onClick={() => setShowKardex(false)}>✕</button>
            </div>
            {kardex.length === 0 ? (
              <div className="empty-state" style={{padding: '30px'}}>
                <div className="empty-icon">📋</div>
                <h3>Sin movimientos</h3>
                <p>Este producto no tiene movimientos registrados.</p>
              </div>
            ) : (
              <div className="table-container" style={{border: 'none'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Origen</th>
                      <th>Cantidad</th>
                      <th>Stock Ant.</th>
                      <th>Stock Nuevo</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kardex.map(k => (
                      <tr key={k.id}>
                        <td style={{fontSize: '12px'}}>{new Date(k.fecha_movimiento).toLocaleString('es-PE')}</td>
                        <td>
                          <span className={`badge ${k.tipo_movimiento === 'INGRESO' ? 'badge-success' : 'badge-danger'}`}>
                            {k.tipo_movimiento === 'INGRESO' ? '📥' : '📤'} {k.tipo_movimiento}
                          </span>
                        </td>
                        <td><span className="badge badge-info">{k.origen}</span></td>
                        <td style={{fontWeight: 700}}>{k.cantidad}</td>
                        <td>{k.stock_anterior}</td>
                        <td style={{fontWeight: 700}}>{k.stock_nuevo}</td>
                        <td style={{fontSize: '12px'}}>{k.usuario_nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
