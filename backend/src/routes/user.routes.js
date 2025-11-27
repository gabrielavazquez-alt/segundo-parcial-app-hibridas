const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Listar todos los traductores (solo PM)
router.get(
    '/translators',
    authMiddleware,
    requireRole('PM'),
    userController.listTranslators
);

module.exports = router;
