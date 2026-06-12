const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

// GET /api/dashboard/summary
// Only logged in users can access this
router.get(
  '/summary',
  authenticate,
  authorize(['Admin', 'Project Manager', 'Collaborator']),
  dashboardController.getSummary
);

module.exports = router;