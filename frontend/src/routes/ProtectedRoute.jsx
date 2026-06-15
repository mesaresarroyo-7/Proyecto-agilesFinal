import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(usuario?.rol)) {
    return (
      <div className="access-denied">
        <h2>⛔ Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
        <p>Rol requerido: <strong>{roles.join(' o ')}</strong></p>
        <p>Tu rol: <strong>{usuario?.rol}</strong></p>
      </div>
    );
  }

  return children;
}
