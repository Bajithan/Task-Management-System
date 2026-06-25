const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/rbac.middleware');
const projectController = require('../controllers/project.controller');

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

/**
 * @swagger
 * /api/projects/names:
 *   get:
 *     summary: Get project names only (Project Managers & Collaborators)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieve project names successfully
 */
router.get('/names', authenticate, allowRoles('Project Manager', 'Collaborator'), projectController.getProjectNames);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects (Project Manager only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieve all projects successfully
 *   post:
 *     summary: Create a new project (Project Manager only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.get('/', authenticate, allowRoles('Project Manager'), projectController.getProjects);
router.post('/', authenticate, allowRoles('Project Manager'), projectController.createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project details by ID (Project Manager only)
 *     tags: [Projects]
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
 *         description: Retrieve project details successfully
 *   put:
 *     summary: Update project details (Project Manager only)
 *     tags: [Projects]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *   delete:
 *     summary: Delete a project (Project Manager only)
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 */
router.get('/:id', authenticate, allowRoles('Project Manager'), projectController.getProjectById);
router.put('/:id', authenticate, allowRoles('Project Manager'), projectController.updateProject);
router.delete('/:id', authenticate, allowRoles('Project Manager'), projectController.deleteProject);

module.exports = router;