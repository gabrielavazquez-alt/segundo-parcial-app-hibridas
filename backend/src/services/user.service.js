const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

function getUsersCollection() {
    const db = getDb();
    return db.collection('Users');
}

/**
 * Buscar un usuario por email
 */
async function findUserByEmail(email) {
    const users = getUsersCollection();
    const user = await users.findOne({ email });
    return user;
}

/**
 * Buscar un usuario por id
 */
async function findUserById(id) {
    const users = getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(id) });
    return user;
}

/**
 * Crear un usuario nuevo
 */
async function createUser({ name, email, passwordHash, role }) {
    const users = getUsersCollection();

    const now = new Date();
    const doc = {
        name,
        email,
        passwordHash,
        role,
        createdAt: now,
        updatedAt: now,
    };

    const result = await users.insertOne(doc);

    return {
        _id: result.insertedId,
        ...doc,
    };
}

async function getTranslators() {
    const users = getUsersCollection();
    return await users
        .find({ role: 'TRANSLATOR' })
        .project({ passwordHash: 0 })
        .sort({ name: 1 })
        .toArray();
}

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    getTranslators,
};
