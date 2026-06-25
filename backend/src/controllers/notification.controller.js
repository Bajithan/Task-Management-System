// backend/src/controllers/notification.controller.js
const NotificationService = require('../services/notification.service');
const { emitSystemEvent } = require('../websocket/socket');

// Get all notifications for the logged-in user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id; 
        const notifications = await NotificationService.getUserNotifications(userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const updatedNotification = await NotificationService.markAsRead(notificationId);
        
        const io = req.app.get('io');
        const userId = req.user.user_id;
        emitSystemEvent(io, userId, 'notifications-updated', { type: 'mark-read', notificationId });
        
        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark all notifications as read at once
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await NotificationService.markAllAsRead(userId);
        
        const io = req.app.get('io');
        emitSystemEvent(io, userId, 'notifications-updated', { type: 'mark-all-read' });
        
        res.status(200).json({ message: 'All notifications marked as read', result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
