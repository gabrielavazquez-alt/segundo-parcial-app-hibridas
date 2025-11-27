const { validationResult } = require('express-validator');
const {
    getProjectsByPM,
    getProjectByIdForPM,
    createProject,
    updateProject,
    deleteProject,
} = require('../services/project.service');

async function list(req, res) {
    try {
        const pmId = req.user.id;

        const projects = await getProjectsByPM(pmId);

        return res.json({ ok: true, projects });
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'Error obteniendo proyectos.' });
    }
}

async function getOne(req, res) {
    try {
        const pmId = req.user.id;
        const projectId = req.params.id;

        const project = await getProjectByIdForPM(projectId, pmId);

        if (!project) {
            return res.status(404).json({ ok: false, message: 'Proyecto no encontrado.' });
        }

        return res.json({ ok: true, project });
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'Error obteniendo proyecto.' });
    }
}

async function create(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ ok: false, errors: errors.array() });
        }

        const pmId = req.user.id;
        const { name, description, status } = req.body;

        const project = await createProject({ pmId, name, description, status });

        return res.status(201).json({ ok: true, project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: 'Error creando proyecto.' });
    }
}

async function update(req, res) {
    try {
        const pmId = req.user.id;
        const projectId = req.params.id;

        const updated = await updateProject(projectId, pmId, req.body);

        if (!updated) {
            return res.status(404).json({ ok: false, message: 'Proyecto no encontrado o no te pertenece.' });
        }

        return res.json({ ok: true, project: updated });
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'Error actualizando proyecto.' });
    }
}

async function remove(req, res) {
    try {
        const pmId = req.user.id;
        const projectId = req.params.id;

        const deleted = await deleteProject(projectId, pmId);

        if (!deleted) {
            return res.status(404).json({ ok: false, message: 'Proyecto no encontrado.' });
        }

        return res.json({ ok: true, message: 'Proyecto eliminado.' });
    } catch (error) {
        return res.status(500).json({ ok: false, message: 'Error eliminando proyecto.' });
    }
}

module.exports = {
    list,
    getOne,
    create,
    update,
    remove,
};
