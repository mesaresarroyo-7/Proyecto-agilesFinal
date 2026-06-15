import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/reportes/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div><p>Cargando dashboard...</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p>Bienvenido, {usuario?.nombre}. Resumen general del sistema.</p>
      </div>

      {data && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">💰</div>
              <div className="stat-info">
                <h3>S/ {data.ventas.ingresos.toFixed(2)}</h3>
                <p>Ingresos Totales</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">🛒</div>
              <div className="stat-info">
                <h3>{data.ventas.total}</h3>
                <p>Ventas Realizadas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">📦</div>
              <div className="stat-info">
                <h3>{data.compras.total}</h3>
                <p>Compras Registradas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">🏪</div>
              <div className="stat-info">
                <h3>{data.productos.total}</h3>
                <p>Productos Activos</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">⚠️</div>
              <div className="stat-info">
                <h3>{data.productos.stock_bajo}</h3>
                <p>Stock Bajo</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon cyan">🏢</div>
              <div className="stat-info">
                <h3>{data.proveedores.total}</h3>
                <p>Proveedores</p>
              </div>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
            {/* Ventas del día */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">📅 Ventas de Hoy</span>
              </div>
              <div className="stats-grid" style={{marginBottom: 0}}>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '32px', fontWeight: 800, color: '#10b981'}}>{data.hoy.ventas}</div>
                  <div style={{fontSize: '13px', color: '#94a3b8'}}>Ventas</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '32px', fontWeight: 800, color: '#3b82f6'}}>S/ {data.hoy.ingresos.toFixed(2)}</div>
                  <div style={{fontSize: '13px', color: '#94a3b8'}}>Ingresos</div>
                </div>
              </div>
            </div>

            {/* Alertas de stock */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">⚠️ Alertas de Stock Bajo</span>
              </div>
              {data.alertas_stock.length === 0 ? (
                <p style={{color: '#10b981', fontSize: '14px'}}>✅ Todos los productos tienen stock suficiente</p>
              ) : (
                <div className="table-container" style={{border: 'none'}}>
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Stock</th>
                        <th>Mínimo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.alertas_stock.map(p => (
                        <tr key={p.id}>
                          <td style={{fontSize: '13px'}}>{p.nombre}</td>
                          <td><span className={p.stock === 0 ? 'stock-low' : 'stock-warning'}>{p.stock}</span></td>
                          <td>{p.stock_minimo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Últimas ventas */}
          {data.ultimas_ventas.length > 0 && (
            <div className="card" style={{marginTop: '24px'}}>
              <div className="card-header">
                <span className="card-title">🕐 Últimas Ventas</span>
              </div>
              <div className="table-container" style={{border: 'none'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Comprobante</th>
                      <th>Tipo</th>
                      <th>Total</th>
                      <th>Vendedor</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ultimas_ventas.map(v => (
                      <tr key={v.id}>
                        <td style={{fontFamily: 'monospace', fontSize: '13px'}}>{v.numero_comprobante}</td>
                        <td><span className="badge badge-primary">{v.tipo_comprobante}</span></td>
                        <td style={{fontWeight: 700}}>S/ {parseFloat(v.total).toFixed(2)}</td>
                        <td>{v.vendedor}</td>
                        <td style={{fontSize: '13px'}}>{new Date(v.fecha_venta).toLocaleString('es-PE')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
