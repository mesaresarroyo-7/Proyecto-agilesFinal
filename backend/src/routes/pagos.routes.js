const express = require('express');
const router = express.Router();
const { validarPago } = require('../controllers/pagos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST /api/pagos/validar
router.post('/validar', authMiddleware, validarPago);

module.exports = router;
