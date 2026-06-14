// backend/src/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', NotificationController.getUserNotifications);
router.patch('/:notificationId/read', NotificationController.markAsRead);
router.patch('/read-all', NotificationController.markAllAsRead);

module.exports = router;