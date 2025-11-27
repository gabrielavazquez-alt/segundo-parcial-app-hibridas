const { validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../services/auth.service');

async function register(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ ok: false, errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        const user = await registerUser({ name, email, password, role });

        return res.status(201).json({
            ok: true,
            message: 'Usuario registrado correctamente.',
            user,
        });
    } catch (error) {
        console.error('Error en register:', error);
        const status = error.statusCode || 500;
        return res.status(status).json({
            ok: false,
            message: error.message || 'Error al registrar usuario.',
        });
    }
}

async function login(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ ok: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        const { token, user } = await loginUser({ email, password });

        return res.json({
            ok: true,
            message: 'Login exitoso.',
            token,
            user,
        });
    } catch (error) {
        console.error('Error en login:', error);
        const status = error.statusCode || 500;
        return res.status(status).json({
            ok: false,
            message: error.message || 'Error al iniciar sesión.',
        });
    }
}

module.exports = {
    register,
    login,
};
