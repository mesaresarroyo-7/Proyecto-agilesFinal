import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Almacen from './pages/Almacen';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Pago from './pages/Pago';
import Reportes from './pages/Reportes';
import './styles/global.css';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/almacen" element={
              <ProtectedRoute>
                <AppLayout><Almacen /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/compras" element={
              <ProtectedRoute roles={['admin', 'almacenero']}>
                <AppLayout><Compras /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/ventas" element={
              <ProtectedRoute roles={['admin', 'vendedor']}>
                <AppLayout><Ventas /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/pago" element={
              <ProtectedRoute roles={['admin', 'vendedor']}>
                <AppLayout><Pago /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/reportes" element={
              <ProtectedRoute roles={['admin']}>
                <AppLayout><Reportes /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
