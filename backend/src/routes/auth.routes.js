const express = require('express');
const router = express.Router();
const { login, getPerfil } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/perfil (protegido)
router.get('/perfil', authMiddleware, getPerfil);

module.exports = router;
