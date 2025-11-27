const { validationResult } = require('express-validator');
const {
    getInstructionsByProject,
    createInstruction,
    updateInstruction,
    deleteInstruction,
} = require('../services/instruction.service');

/**
 * PM: listar instrucciones de un proyecto
 */
async function listForProject(req, res) {
    try {
        const pmId = req.user.id;
        const { projectId } = req.params;

        const instructions = await getInstructionsByProject(projectId, pmId);

        if (instructions === null) {
            return res
                .status(404)
                .json({ ok: false, message: 'Proyecto no encontrado o no te pertenece.' });
        }

        return res.json({ ok: true, instructions });
    } catch (error) {
        return res
            .status(500)
            .json({ ok: false, message: 'Error obteniendo instrucciones.' });
    }
}

/**
 * PM: crear instrucción
 */
async function create(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ ok: false, errors: errors.array() });
        }

        const pmId = req.user.id;
        const { projectId } = req.params;
        const { content } = req.body;

        const instruction = await createInstruction({ pmId, projectId, content });

        if (!instruction) {
            return res
                .status(404)
                .json({ ok: false, message: 'Proyecto no encontrado o no te pertenece.' });
        }

        return res.status(201).json({ ok: true, instruction });
    } catch (error) {
        return res
            .status(500)
            .json({ ok: false, message: 'Error creando instrucción.' });
    }
}

/**
 * PM: actualizar instrucción
 */
async function update(req, res) {
    try {
        const pmId = req.user.id;
        const { instructionId } = req.params;
        const { content } = req.body;

        const updated = await updateInstruction(instructionId, pmId, content);

        if (!updated) {
            return res
                .status(404)
                .json({ ok: false, message: 'Instrucción no encontrada o no te pertenece.' });
        }

        return res.json({ ok: true, instruction: updated });
    } catch (error) {
        return res
            .status(500)
            .json({ ok: false, message: 'Error actualizando instrucción.' });
    }
}

/**
 * PM: eliminar instrucción
 */
async function remove(req, res) {
    try {
        const pmId = req.user.id;
        const { instructionId } = req.params;

        const deleted = await deleteInstruction(instructionId, pmId);

        if (!deleted) {
            return res
                .status(404)
                .json({ ok: false, message: 'Instrucción no encontrada o no te pertenece.' });
        }

        return res.json({ ok: true, message: 'Instrucción eliminada.' });
    } catch (error) {
        return res
            .status(500)
            .json({ ok: false, message: 'Error eliminando instrucción.' });
    }
}

module.exports = {
    listForProject,
    create,
    update,
    remove,
};
