const express = require('express');
const router = express.Router();
const { getProductos, getProductoById, createProducto, updateProducto, deleteProducto, getCategorias } = require('../controllers/productos.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/productos/categorias/lista (debe ir antes de /:id)
router.get('/categorias/lista', authMiddleware, getCategorias);

// GET /api/productos
router.get('/', authMiddleware, getProductos);

// GET /api/productos/:id
router.get('/:id', authMiddleware, getProductoById);

// POST /api/productos (solo admin, almacenero)
router.post('/', authMiddleware, roleMiddleware('admin', 'almacenero'), createProducto);

// PUT /api/productos/:id (solo admin, almacenero)
router.put('/:id', authMiddleware, roleMiddleware('admin', 'almacenero'), updateProducto);

// DELETE /api/productos/:id (solo admin, almacenero)
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'almacenero'), deleteProducto);

module.exports = router;
