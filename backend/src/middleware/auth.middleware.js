const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || '';


    const [scheme, token] = authHeader.split(' ');

    if (!token || scheme !== 'Bearer') {
        return res.status(401).json({ ok: false, message: 'No se encontró token de autorización.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({ ok: false, message: 'Token inválido o expirado.' });
    }
}


function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ ok: false, message: 'No tenés permisos para realizar esta acción.' });
        }
        next();
    };
}

module.exports = {
    authMiddleware,
    requireRole,
};
