import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-icon">DC</div>
            <h2>DollarCity</h2>
            <p>Sistema de Gestión - Sede Santa Anita</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="usuario@dollarcity.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Iniciando sesión...' : '🔐 Iniciar Sesión'}
            </button>
          </form>

          <div style={{marginTop: '24px', padding: '16px', background: 'rgba(37,99,235,0.1)', borderRadius: '10px'}}>
            <p style={{fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600'}}>
              👤 Credenciales de prueba:
            </p>
            <p style={{fontSize: '12px', color: '#64748b'}}>
              Admin: admin@dollarcity.pe / Admin123!<br/>
              Vendedor: vendedor@dollarcity.pe / Vendedor123!<br/>
              Almacén: almacen@dollarcity.pe / Almacen123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
