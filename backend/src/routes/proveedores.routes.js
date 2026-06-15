const express = require('express');
const router = express.Router();
const { getProveedores, getProveedorById, createProveedor, updateProveedor, deleteProveedor } = require('../controllers/proveedores.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/proveedores
router.get('/', authMiddleware, getProveedores);

// GET /api/proveedores/:id
router.get('/:id', authMiddleware, getProveedorById);

// POST /api/proveedores (solo admin, almacenero)
router.post('/', authMiddleware, roleMiddleware('admin', 'almacenero'), createProveedor);

// PUT /api/proveedores/:id (solo admin, almacenero)
router.put('/:id', authMiddleware, roleMiddleware('admin', 'almacenero'), updateProveedor);

// DELETE /api/proveedores/:id (solo admin)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteProveedor);

module.exports = router;
