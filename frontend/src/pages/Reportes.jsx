import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Reportes() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReporte();
  }, []);

  const fetchReporte = async () => {
    try {
      const res = await api.get('/reportes/productos-mas-vendidos');
      setProductos(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Cargando reportes...</p></div>;

  // Datos para gráfico simple con barras CSS
  const maxVendido = productos.length > 0 ? Math.max(...productos.map(p => parseInt(p.total_vendido))) : 1;

  return (
    <div>
      <div className="page-header">
        <h2>📈 Reportes</h2>
        <p>Análisis de ventas y productos más vendidos</p>
      </div>

      {/* Gráfico simple de barras */}
      {productos.length > 0 && (
        <div className="card" style={{marginBottom: '24px'}}>
          <h3 className="card-title" style={{marginBottom: '24px'}}>📊 Top Productos Más Vendidos</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {productos.slice(0, 10).map((p, idx) => (
              <div key={p.id} style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <span style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `hsl(${220 + idx * 15}, 70%, ${55 - idx * 3}%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0
                }}>
                  {idx + 1}
                </span>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span style={{fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {p.nombre}
                    </span>
                    <span style={{fontSize: '13px', fontWeight: 700, color: 'var(--success)', flexShrink: 0, marginLeft: '8px'}}>
                      {p.total_vendido} uds.
                    </span>
                  </div>
                  <div style={{
                    height: '8px', borderRadius: '4px',
                    background: 'var(--bg-input)', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '4px',
                      background: `linear-gradient(90deg, hsl(${220 + idx * 15}, 70%, 55%), hsl(${220 + idx * 15}, 70%, 45%))`,
                      width: `${(parseInt(p.total_vendido) / maxVendido) * 100}%`,
                      transition: 'width 0.8s ease'
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla detallada */}
      <div className="card">
        <h3 className="card-title" style={{marginBottom: '20px'}}>📋 Detalle de Ventas por Producto</h3>
        
        {productos.length === 0 ? (
          <div className="empty-state" style={{padding: '30px'}}>
            <div className="empty-icon">📊</div>
            <h3>Sin datos de ventas</h3>
            <p>Realice ventas para ver el reporte</p>
          </div>
        ) : (
          <div className="table-container" style={{border: 'none'}}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th>Total Vendido</th>
                  <th>Veces Vendido</th>
                  <th>Ingresos</th>
                  <th>Stock Actual</th>
                  <th>Precio Actual</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{fontWeight: 700}}>{idx + 1}</td>
                    <td style={{fontWeight: 600}}>{p.nombre}</td>
                    <td style={{fontFamily: 'monospace', fontSize: '12px'}}>{p.codigo_barras}</td>
                    <td><span className="badge badge-info">{p.categoria || 'General'}</span></td>
                    <td style={{fontWeight: 700, color: 'var(--success)'}}>{p.total_vendido} uds.</td>
                    <td>{p.veces_vendido} veces</td>
                    <td style={{fontWeight: 700}}>S/ {parseFloat(p.total_ingresos).toFixed(2)}</td>
                    <td>
                      <span className={parseInt(p.stock_actual) <= 10 ? 'stock-warning' : 'stock-ok'}>
                        {p.stock_actual}
                      </span>
                    </td>
                    <td>S/ {parseFloat(p.precio_actual).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
