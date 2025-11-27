const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { createUser, findUserByEmail } = require('./user.service');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

/**
 * Registrar un usuario nuevo (PM o TRADUCTOR)
 */
async function registerUser({ name, email, password, role }) {

    const normalizedRole = (role || 'TRANSLATOR').toUpperCase();

    if (!['PM', 'TRANSLATOR'].includes(normalizedRole)) {
        const error = new Error('Rol inválido. Debe ser PM o TRANSLATOR.');
        error.statusCode = 400;
        throw error;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
        const error = new Error('Ya existe un usuario con ese email.');
        error.statusCode = 409; 
        throw error;
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await createUser({
        name,
        email,
        passwordHash,
        role: normalizedRole,
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
}

/**
 * Login
 */
async function loginUser({ email, password }) {
    const user = await findUserByEmail(email);
    if (!user) {
        const error = new Error('Credenciales inválidas.');
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        const error = new Error('Credenciales inválidas.');
        error.statusCode = 401;
        throw error;
    }

    const payload = {
        id: user._id.toString(),
        role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    const { passwordHash: _, ...safeUser } = user;

    return {
        token,
        user: safeUser,
    };
}

module.exports = {
    registerUser,
    loginUser,
};
