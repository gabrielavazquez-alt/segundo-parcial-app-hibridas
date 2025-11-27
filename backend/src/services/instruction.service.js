const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

function getInstructionsCollection() {
    const db = getDb();
    return db.collection('Instructions');
}

/**
 * PM: obtener instrucciones de un proyecto propio
 */
async function getInstructionsByProject(projectId, pmId) {
    const instructions = getInstructionsCollection();
    const db = getDb();

    const project = await db.collection('Projects').findOne({
        _id: new ObjectId(projectId),
        ownerId: new ObjectId(pmId),
    });

    if (!project) return null;

    return await instructions
        .find({ projectId: new ObjectId(projectId) })
        .sort({ createdAt: 1 })
        .toArray();
}

/**
 * PM: crear instrucción en un proyecto propio
 */
async function createInstruction({ pmId, projectId, content }) {
    const instructions = getInstructionsCollection();
    const db = getDb();

    const project = await db.collection('Projects').findOne({
        _id: new ObjectId(projectId),
        ownerId: new ObjectId(pmId),
    });

    if (!project) return null;

    const now = new Date();

    const doc = {
        projectId: new ObjectId(projectId),
        authorId: new ObjectId(pmId),
        content,
        createdAt: now,
        updatedAt: now,
    };

    const result = await instructions.insertOne(doc);
    return { _id: result.insertedId, ...doc };
}

/**
 * PM: actualizar instrucción propia en proyecto propio
 */
async function updateInstruction(instructionId, pmId, content) {
    const instructions = getInstructionsCollection();
    const db = getDb();

    const instruction = await instructions.findOne({ _id: new ObjectId(instructionId) });
    if (!instruction) return null;

    const project = await db.collection('Projects').findOne({
        _id: instruction.projectId,
        ownerId: new ObjectId(pmId),
    });

    if (!project) return null;

    const result = await instructions.findOneAndUpdate(
        {
            _id: new ObjectId(instructionId),
            authorId: new ObjectId(pmId),
        },
        {
            $set: {
                content,
                updatedAt: new Date(),
            },
        },
        { returnDocument: 'after' }
    );

    return result.value;
}

/**
 * PM: borrar instrucción propia en proyecto propio
 */
async function deleteInstruction(instructionId, pmId) {
    const instructions = getInstructionsCollection();
    const db = getDb();

    const instruction = await instructions.findOne({ _id: new ObjectId(instructionId) });
    if (!instruction) return false;

    const project = await db.collection('Projects').findOne({
        _id: instruction.projectId,
        ownerId: new ObjectId(pmId),
    });

    if (!project) return false;

    const result = await instructions.deleteOne({
        _id: new ObjectId(instructionId),
        authorId: new ObjectId(pmId),
    });

    return result.deletedCount > 0;
}

module.exports = {
    getInstructionsByProject,
    createInstruction,
    updateInstruction,
    deleteInstruction,
};
