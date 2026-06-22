const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/rbac.middleware');

router.get(
  '/summary',
  authenticate,
  allowRoles('Project Manager', 'Collaborator'),
  dashboardController.getSummary
);

router.get(
  '/system-config',
  authenticate,
  allowRoles('Admin'),
  dashboardController.getSystemConfig
);

module.exports = router;