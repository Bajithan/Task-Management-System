const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get(
  '/summary',
  authenticate,
  dashboardController.getSummary
);

module.exports = router;