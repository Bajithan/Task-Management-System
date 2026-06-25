const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/rbac.middleware');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard data aggregation and configurations
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get tasks summary metrics for the dashboard (Project Managers & Collaborators)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieve dashboard stats successfully
 */
router.get(
  '/summary',
  authenticate,
  allowRoles('Project Manager', 'Collaborator'),
  dashboardController.getSummary
);

/**
 * @swagger
 * /api/dashboard/system-config:
 *   get:
 *     summary: Retrieve system configuration and logs (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieve config settings successfully
 */
router.get(
  '/system-config',
  authenticate,
  allowRoles('Admin'),
  dashboardController.getSystemConfig
);

module.exports = router;