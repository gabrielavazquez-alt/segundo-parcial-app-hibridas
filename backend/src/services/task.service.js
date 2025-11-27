const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

function getTasksCollection() {
    const db = getDb();
    return db.collection('Tasks');
}

/**
 * PM: obtener tareas de un proyecto propio
 */
async function getTasksByProject(projectId, pmId) {
    const tasks = getTasksCollection();
    const db = getDb();

    const project = await db.collection('Projects').findOne({
        _id: new ObjectId(projectId),
        ownerId: new ObjectId(pmId),
    });

    if (!project) return null;

    return await tasks
        .find({ projectId: new ObjectId(projectId) })
        .sort({ createdAt: 1 })
        .toArray();
}

/**
 * TRADUCTOR: obtener SOLO sus tareas visibles,
 */
async function getTasksByTranslator(userId) {
    const tasksCol = getTasksCollection();
    const db = getDb();

    const tasks = await tasksCol
        .find({
            assignedTo: new ObjectId(userId),
            status: { $ne: 'REJECTED' },
        })
        .sort({ createdAt: 1 })
        .toArray();

    if (tasks.length === 0) return [];

    const projectIds = [
        ...new Set(
            tasks
                .map((t) => t.projectId && t.projectId.toString())
                .filter(Boolean)
        ),
    ];

    const projects = await db
        .collection('Projects')
        .find({ _id: { $in: projectIds.map((id) => new ObjectId(id)) } })
        .project({ name: 1 })
        .toArray();

    const projectNameById = new Map(
        projects.map((p) => [p._id.toString(), p.name || 'Proyecto sin nombre'])
    );

    return tasks.map((t) => ({
        ...t,
        projectName:
            projectNameById.get(t.projectId?.toString()) ||
            'Proyecto sin nombre',
    }));
}


/**
 * PM: crear tarea
 */
async function createTask({ pmId, projectId, title, description, assignedTo, dueDate }) {
    const tasks = getTasksCollection();
    const db = getDb();

    const project = await db.collection('Projects').findOne({
        _id: new ObjectId(projectId),
        ownerId: new ObjectId(pmId),
    });

    if (!project) {
        const error = new Error('Proyecto no encontrado o no te pertenece.');
        error.statusCode = 404;
        throw error;
    }

    const now = new Date();

    const doc = {
        projectId: new ObjectId(projectId),
        title,
        description: description || '',
        assignedTo: assignedTo ? new ObjectId(assignedTo) : null,
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
    };

    const result = await tasks.insertOne(doc);
    return { _id: result.insertedId, ...doc };
}

/**
 * PM: actualizar tarea (datos generales)
 */
async function updateTask(taskId, pmId, data) {
    const tasks = getTasksCollection();
    const db = getDb();

    const task = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (!task) return null;

    const project = await db.collection('Projects').findOne({
        _id: task.projectId,
        ownerId: new ObjectId(pmId),
    });

    if (!project) return null;

    const updateData = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) {
        updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    if (data.status !== undefined) {
        updateData.status = data.status;

        if (data.status === 'COMPLETED') {
            updateData.completedAt = new Date();
        } else {
            updateData.completedAt = null;
        }
    }

    const now = new Date();

    const result = await tasks.updateOne(
        { _id: task._id },
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

    return {
        ...task,
        ...updateData,
        updatedAt: now,
    };
}

/**
 * PM: eliminar tarea
 */
async function deleteTask(taskId, pmId) {
    const tasks = getTasksCollection();
    const db = getDb();

    const task = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (!task) return false;

    const project = await db.collection('Projects').findOne({
        _id: task.projectId,
        ownerId: new ObjectId(pmId),
    });

    if (!project) return false;

    const result = await tasks.deleteOne({ _id: new ObjectId(taskId) });
    return result.deletedCount > 0;
}


/**
 * TRADUCTOR: cambiar estado de una tarea propia con reglas:
 * - PENDING -> ACCEPTED
 * - PENDING -> REJECTED  (se desasigna, PM podrá reasignar)
 * - ACCEPTED -> COMPLETED (setea completedAt)
 * - Cualquier otra transición: error
 */
async function translatorUpdateStatus(taskId, userId, newStatus) {
    const tasks = getTasksCollection();

    const task = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (!task) return null;

    if (
        task.assignedTo &&
        task.assignedTo.toString() !== userId.toString()
    ) {
        return null;
    }

    const currentStatus = task.status;
    const update = {};

    if (currentStatus === 'PENDING' && newStatus === 'ACCEPTED') {
        update.status = 'ACCEPTED';
        update.completedAt = null;
    } else if (currentStatus === 'PENDING' && newStatus === 'REJECTED') {
        update.status = 'REJECTED';
        update.assignedTo = null;
        update.completedAt = null;
    } else if (currentStatus === 'ACCEPTED' && newStatus === 'COMPLETED') {
        update.status = 'COMPLETED';
        update.completedAt = new Date();
    } else {
        const error = new Error('Transición de estado no permitida.');
        error.statusCode = 400;
        throw error;
    }

    await tasks.updateOne(
        { _id: task._id },
        {
            $set: {
                ...update,
                updatedAt: new Date(),
            },
        }
    );

    return {
        ...task,
        ...update,
    };
}

/**
 * PM: reasignar tarea a otro traductor
 */
async function reassignTask(taskId, pmId, newTranslatorId) {
    const tasks = getTasksCollection();
    const db = getDb();


    const task = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (!task) return null;

    const project = await db.collection('Projects').findOne({
        _id: task.projectId,
        ownerId: new ObjectId(pmId),
    });

    if (!project) return null;

    const now = new Date();

    const updateData = {
        assignedTo: new ObjectId(newTranslatorId),
        status: 'PENDING',
        completedAt: null,
        updatedAt: now,
    };

    const result = await tasks.updateOne(
        { _id: task._id },
        {
            $set: updateData,
        }
    );

    if (result.matchedCount === 0) {
        return null;
    }

    return {
        ...task,
        ...updateData,
    };
}


module.exports = {
    getTasksByProject,
    getTasksByTranslator,
    createTask,
    updateTask,
    deleteTask,
    translatorUpdateStatus,
    reassignTask,
};
