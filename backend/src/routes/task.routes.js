const express = require('express');
const { body } = require('express-validator');
const taskController = require('../controllers/task.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// PM: tareas por proyecto
router.get(
    '/project/:projectId',
    authMiddleware,
    requireRole('PM'),
    taskController.listForProject
);

// PM: crear tarea
router.post(
    '/project/:projectId',
    authMiddleware,
    requireRole('PM'),
    [
        body('title').notEmpty().withMessage('El título es obligatorio.'),
        body('assignedTo').notEmpty().withMessage('Debe asignarse un traductor.'),
        body('dueDate').notEmpty().withMessage('La fecha de entrega es obligatoria.'),
    ],
    taskController.create
);

// PM: actualizar tarea
router.put(
    '/:taskId',
    authMiddleware,
    requireRole('PM'),
    taskController.update
);

// PM: eliminar tarea
router.delete(
    '/:taskId',
    authMiddleware,
    requireRole('PM'),
    taskController.remove
);

// PM: reasignar tarea
router.patch(
    '/:taskId/reassign',
    authMiddleware,
    requireRole('PM'),
    [body('assignedTo').notEmpty().withMessage('Debe indicar el traductor.')],
    taskController.reassign
);

// TRADUCTOR: ver sus tareas
router.get(
    '/translator/me',
    authMiddleware,
    requireRole('TRANSLATOR'),
    taskController.listForTranslator
);

// TRADUCTOR: cambiar estado (aceptar / rechazar / completar)
router.patch(
    '/translator/:taskId',
    authMiddleware,
    requireRole('TRANSLATOR'),
    [
        body('status')
            .isIn(['ACCEPTED', 'REJECTED', 'COMPLETED'])
            .withMessage('Estado inválido'),
    ],
    taskController.translatorAction
);

module.exports = router;
