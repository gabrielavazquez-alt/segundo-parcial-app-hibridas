const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

function getProjectsCollection() {
    const db = getDb();
    return db.collection('Projects');
}

// Listar proyectos del PM
async function getProjectsByPM(pmId) {
    const projects = getProjectsCollection();
    return await projects.find({ ownerId: new ObjectId(pmId) }).toArray();
}

// Obtener un proyecto del PM
async function getProjectByIdForPM(projectId, pmId) {
    const projects = getProjectsCollection();

    const project = await projects.findOne({
        _id: new ObjectId(projectId),
        ownerId: new ObjectId(pmId),
    });

    return project;
}

// Crear un proyecto
async function createProject({ pmId, name, description, status }) {
    const projects = getProjectsCollection();

    const now = new Date();

    const doc = {
        name,
        description,
        status: status || 'PENDING',
        ownerId: new ObjectId(pmId),
        createdAt: now,
        updatedAt: now,
    };

    const result = await projects.insertOne(doc);

    return {
        _id: result.insertedId,
        ...doc,
    };
}

/**
 * PM: actualizar proyecto (nombre, descripción, estado)
 */
async function updateProject(projectId, pmId, data) {
    const db = getDb();
    const projects = db.collection('Projects');

    // 1) Buscar el proyecto del PM
    const project = await projects.findOne({
        _id: new ObjectId(projectId),
        ownerId: new ObjectId(pmId),
    });

    if (!project) return null;

    // 2) Armar campos a actualizar
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    const now = new Date();

    // 3) Actualizar sin depender de result.value
    const result = await projects.updateOne(
        { _id: project._id },
        {
            $set: {
                ...updateData,
                updatedAt: now,
            },
        }
    );

    if (result.matchedCount === 0) {
        return null;
    }

    // 4) Devolver objeto combinado (truthy)
    return {
        ...project,
        ...updateData,
        updatedAt: now,
    };
}

// Eliminar proyecto
async function deleteProject(projectId, pmId) {
    const projects = getProjectsCollection();

    const result = await projects.deleteOne({
        _id: new ObjectId(projectId),
        ownerId: new ObjectId(pmId),
    });

    return result.deletedCount > 0;
}

module.exports = {
    getProjectsByPM,
    getProjectByIdForPM,
    createProject,
    updateProject,
    deleteProject,
};
