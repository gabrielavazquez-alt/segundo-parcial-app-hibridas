const { validationResult } = require('express-validator');
const {
    getTasksByProject,
    getTasksByTranslator,
    createTask,
    updateTask,
    deleteTask,
    translatorUpdateStatus,
    reassignTask,
} = require('../services/task.service');

/**
 * PM: lista tareas de un proyecto
 */
async function listForProject(req, res) {
    try {
        const pmId = req.user.id;
        const projectId = req.params.projectId;

        const tasks = await getTasksByProject(projectId, pmId);

        if (tasks === null) {
            return res
                .status(404)
                .json({ ok: false, message: 'Proyecto no encontrado o no te pertenece.' });
        }

        return res.json({ ok: true, tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: 'Error obteniendo tareas.' });
    }
}

/**
 * TRADUCTOR: lista sus tareas
 */
async function listForTranslator(req, res) {
    try {
        const userId = req.user.id;
        const tasks = await getTasksByTranslator(userId);
        return res.json({ ok: true, tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: 'Error obteniendo tareas.' });
    }
}

/**
 * PM: crear tarea
 */
async function create(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ ok: false, errors: errors.array() });

        const pmId = req.user.id;
        const { projectId } = req.params;
        const { title, description, assignedTo, dueDate } = req.body;

        const task = await createTask({
            pmId,
            projectId,
            title,
            description,
            assignedTo,
            dueDate,
        });

        return res.status(201).json({ ok: true, task });
    } catch (error) {
        console.error(error);
        const status = error.statusCode || 500;
        return res.status(status).json({
            ok: false,
            message: error.message || 'Error creando tarea.',
        });
    }
}

/**
 * PM: actualizar tarea 
 */
async function update(req, res) {
    try {
        const pmId = req.user.id;
        const { taskId } = req.params;

        const updated = await updateTask(taskId, pmId, req.body);

        if (!updated) {
            return res
                .status(404)
                .json({ ok: false, message: 'Tarea no encontrada o no te pertenece.' });
        }

        return res.json({ ok: true, task: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: 'Error actualizando tarea.' });
    }
}

/**
 * PM: eliminar tarea
 */
async function remove(req, res) {
    try {
        const pmId = req.user.id;
        const { taskId } = req.params;

        const deleted = await deleteTask(taskId, pmId);

        if (!deleted) {
            return res
                .status(404)
                .json({ ok: false, message: 'Tarea no encontrada o no te pertenece.' });
        }

        return res.json({ ok: true, message: 'Tarea eliminada.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: 'Error eliminando tarea.' });
    }
}

/**
 * TRADUCTOR: aceptar / rechazar / completar
 */
async function translatorAction(req, res) {
    try {
        const userId = req.user.id;
        const { taskId } = req.params;
        const { status } = req.body;

        const updated = await translatorUpdateStatus(taskId, userId, status);

        if (!updated) {
            return res
                .status(403)
                .json({ ok: false, message: 'No podés modificar esta tarea.' });
        }

        return res.json({ ok: true, task: updated });
    } catch (error) {
        console.error(error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            ok: false,
            message: error.message || 'Error cambiando estado.',
        });
    }
}

/**
 * PM: reasignar tarea a otro traductor
 */
async function reassign(req, res) {
    try {
        const pmId = req.user.id;
        const { taskId } = req.params;
        const { assignedTo } = req.body;

        if (!assignedTo) {
            return res
                .status(400)
                .json({ ok: false, message: 'Debe indicar el traductor a asignar.' });
        }

        const updated = await reassignTask(taskId, pmId, assignedTo);

        if (!updated) {
            return res
                .status(404)
                .json({ ok: false, message: 'Tarea no encontrada o no te pertenece.' });
        }

        return res.json({ ok: true, task: updated });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ ok: false, message: 'Error reasignando tarea.' });
    }
}

module.exports = {
    listForProject,
    listForTranslator,
    create,
    update,
    remove,
    translatorAction,
    reassign,
};
