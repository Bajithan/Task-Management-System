const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/rbac.middleware');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve all tasks (Project Managers & Collaborators)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieve tasks list successfully
 *   post:
 *     summary: Create a new task (Project Manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - priority
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *               status:
 *                 type: string
 *                 enum: [To Do, In Progress, Completed]
 *               assigned_user_id:
 *                 type: integer
 *               project_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.get('/', authenticate, allowRoles('Project Manager', 'Collaborator'), TaskController.getAllTasks);
router.post('/', authenticate, allowRoles('Project Manager'), TaskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task details by ID (Project Managers & Collaborators)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retrieve task successfully
 *   put:
 *     summary: Update task details (Project Manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *               status:
 *                 type: string
 *                 enum: [To Do, In Progress, Completed]
 *               assigned_user_id:
 *                 type: integer
 *               project_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated successfully
 *   delete:
 *     summary: Delete a task (Project Manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
router.get('/:id', authenticate, allowRoles('Project Manager', 'Collaborator'), TaskController.getTaskById);
router.put('/:id', authenticate, allowRoles('Project Manager'), TaskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status (Project Managers & Collaborators)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [To Do, In Progress, Completed]
 *     responses:
 *       200:
 *         description: Task status updated successfully
 */
router.patch('/:id/status', authenticate, allowRoles('Project Manager', 'Collaborator'), TaskController.updateStatus);
router.delete('/:id', authenticate, allowRoles('Project Manager'), TaskController.deleteTask);

module.exports = router;