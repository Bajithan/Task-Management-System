const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');

// Define your API endpoints
router.get('/', TaskController.getAllTasks);
router.post('/', TaskController.createTask);

module.exports = router;