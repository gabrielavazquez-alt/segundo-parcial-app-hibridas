const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/project.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware, requireRole('PM'));

// GET /api/projects
router.get('/', projectController.list);

// GET /api/projects/:id
router.get('/:id', projectController.getOne);

// POST /api/projects
router.post(
    '/',
    [
        body('name').notEmpty().withMessage('El nombre es obligatorio.'),
        body('description').notEmpty().withMessage('La descripción es obligatoria.'),
    ],
    projectController.create
);

// PUT /api/projects/:id
router.put('/:id', projectController.update);

// DELETE /api/projects/:id
router.delete('/:id', projectController.remove);

module.exports = router;
