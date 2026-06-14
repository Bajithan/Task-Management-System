const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
// Import your auth middleware here
const { authenticate, allowRoles } = require('../middlewares/auth.middleware'); 

// GET /api/tasks (All authenticated users)
router.get('/', authenticate, TaskController.getAllTasks);

// POST /api/tasks (Admin and Project Manager only)
router.post('/', authenticate, allowRoles(['Admin', 'Project Manager']), TaskController.createTask);

// GET /api/tasks/:id (All authenticated users)
router.get('/:id', authenticate, TaskController.getTaskById);

// PUT /api/tasks/:id (Admin and Project Manager only)
router.put('/:id', authenticate, allowRoles(['Admin', 'Project Manager']), TaskController.updateTask);

// PATCH /api/tasks/:id/status (All authenticated users)
router.patch('/:id/status', authenticate, TaskController.updateStatus);

// DELETE /api/tasks/:id (Admin and Project Manager only)
router.delete('/:id', authenticate, allowRoles(['Admin', 'Project Manager']), TaskController.deleteTask);

module.exports = router;