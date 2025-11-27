const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// POST /api/auth/register
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('El nombre es obligatorio.'),
        body('email').isEmail().withMessage('Email inválido.'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres.'),
        body('role')
            .optional()
            .isIn(['PM', 'TRANSLATOR'])
            .withMessage('El rol debe ser PM o TRANSLATOR.'),
    ],
    authController.register
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email inválido.'),
        body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
    ],
    authController.login
);

module.exports = router;
