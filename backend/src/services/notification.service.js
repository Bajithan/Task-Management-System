// backend/src/services/notification.service.js
const NotificationModel = require('../models/notification.model');

// Create a new notification
const createNotification = async (userId, message) => {
    return await NotificationModel.createNotification({ user_id: userId, message });
};

// Get all notifications for the logged-in user
const getUserNotifications = async (userId) => {
    return await NotificationModel.findByUser(userId);
};

// Mark one specific notification as read
const markAsRead = async (notificationId) => {
    return await NotificationModel.markRead(notificationId);
};

// Mark all of a user's notifications as read at once
const markAllAsRead = async (userId) => {
    return await NotificationModel.markAllRead(userId);
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};