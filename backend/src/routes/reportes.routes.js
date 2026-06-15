const express = require('express');
const router = express.Router();
const { productosMasVendidos, resumenDashboard } = require('../controllers/reportes.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/reportes/productos-mas-vendidos (solo admin)
router.get('/productos-mas-vendidos', authMiddleware, roleMiddleware('admin'), productosMasVendidos);

// GET /api/reportes/dashboard (solo admin)
router.get('/dashboard', authMiddleware, roleMiddleware('admin'), resumenDashboard);

module.exports = router;
