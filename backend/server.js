require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./src/middlewares/error.middleware');

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const productosRoutes = require('./src/routes/productos.routes');
const proveedoresRoutes = require('./src/routes/proveedores.routes');
const comprasRoutes = require('./src/routes/compras.routes');
const ventasRoutes = require('./src/routes/ventas.routes');
const reportesRoutes = require('./src/routes/reportes.routes');
const pagosRoutes = require('./src/routes/pagos.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log de requests en desarrollo
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Montar rutas con prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/pagos', pagosRoutes);

// Ruta de verificación
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'DollarCity Santa Anita - Backend activo',
    timestamp: new Date().toISOString()
  });
});

// Middleware global de errores (debe ir al final)
app.use(errorMiddleware);

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('==============================================');
  console.log('  DollarCity Santa Anita - Backend');
  console.log(`  Servidor corriendo en http://localhost:${PORT}`);
  console.log(`  API Base: http://localhost:${PORT}/api`);
  console.log('==============================================');
  console.log('');
});
