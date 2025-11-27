const express = require('express');
const { body } = require('express-validator');
const instructionController = require('../controllers/instruction.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Todas las rutas de instrucciones son solo para PM
router.use(authMiddleware, requireRole('PM'));

// GET /api/instructions/project/:projectId
router.get('/project/:projectId', instructionController.listForProject);

// POST /api/instructions/project/:projectId
router.post(
    '/project/:projectId',
    [body('content').notEmpty().withMessage('El contenido es obligatorio.')],
    instructionController.create
);

// PUT /api/instructions/:instructionId
router.put('/:instructionId', instructionController.update);

// DELETE /api/instructions/:instructionId
router.delete('/:instructionId', instructionController.remove);

module.exports = router;
