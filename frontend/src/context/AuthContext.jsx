import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsuario = localStorage.getItem('usuario');
    if (savedToken && savedUsuario) {
      setToken(savedToken);
      setUsuario(JSON.parse(savedUsuario));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, usuario: userData } = response.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('usuario', JSON.stringify(userData));
    setToken(newToken);
    setUsuario(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  const value = {
    usuario,
    token,
    loading,
    isAuthenticated: !!token,
    rol: usuario?.rol || null,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export default AuthContext;
