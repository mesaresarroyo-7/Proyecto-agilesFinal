import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">DC</div>
          <div>
            <h1>DollarCity</h1>
            <span className="subtitle">Sede Santa Anita</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-title">Principal</span>
        <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>
          Dashboard
        </NavLink>

        <span className="nav-section-title">Operaciones</span>
        <NavLink to="/ventas" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🛒</span>
          Ventas
          {count > 0 && <span className="cart-badge">{count}</span>}
        </NavLink>
        <NavLink to="/pago" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">💳</span>
          Pago
          {count > 0 && <span className="cart-badge">{count}</span>}
        </NavLink>
        <NavLink to="/compras" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📦</span>
          Compras
        </NavLink>

        <span className="nav-section-title">Gestión</span>
        <NavLink to="/almacen" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🏪</span>
          Almacén
        </NavLink>
        
        {usuario?.rol === 'admin' && (
          <NavLink to="/reportes" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📈</span>
            Reportes
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{getInitials(usuario?.nombre)}</div>
          <div className="user-details">
            <div className="user-name">{usuario?.nombre}</div>
            <div className="user-role">{usuario?.rol}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
