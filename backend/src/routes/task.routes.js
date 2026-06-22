const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/rbac.middleware');

// GET /api/tasks - Project Manager and Collaborator only (Admin blocked)
router.get('/', authenticate, allowRoles('Project Manager', 'Collaborator'), TaskController.getAllTasks);

// POST /api/tasks - Project Manager only
router.post('/', authenticate, allowRoles('Project Manager'), TaskController.createTask);

// GET /api/tasks/:id - Project Manager and Collaborator only
router.get('/:id', authenticate, allowRoles('Project Manager', 'Collaborator'), TaskController.getTaskById);

// PUT /api/tasks/:id - Project Manager only
router.put('/:id', authenticate, allowRoles('Project Manager'), TaskController.updateTask);

// PATCH /api/tasks/:id/status - Project Manager and Collaborator
router.patch('/:id/status', authenticate, allowRoles('Project Manager', 'Collaborator'), TaskController.updateStatus);

// DELETE /api/tasks/:id - Project Manager only
router.delete('/:id', authenticate, allowRoles('Project Manager'), TaskController.deleteTask);

module.exports = router;