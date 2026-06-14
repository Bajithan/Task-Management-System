// backend/src/models/notification.model.js
const supabase = require('../config/db'); 

// 1. Create a new notification
const createNotification = async (data) => {
    const { data: notification, error } = await supabase
        .from('Notifications')
        .insert([{ 
            message: data.message, 
            user_id: data.user_id 
        }])
        .select();
        
    if (error) throw error;
    return notification[0];
};

// 2. Find all notifications for a specific user
const findByUser = async (userId) => {
    const { data: notifications, error } = await supabase
        .from('Notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); // Shows newest notifications at the top
        
    if (error) throw error;
    return notifications;
};

// 3. Mark a specific notification as read
const markRead = async (notificationId) => {
    const { data, error } = await supabase
        .from('Notifications')
        .update({ is_read: true }) // Changes the unread status
        .eq('notification_id', notificationId)
        .select();
        
    if (error) throw error;
    return data[0];
};

// 4. Mark all notifications as read for a user
const markAllRead = async (userId) => {
    const { data, error } = await supabase
        .from('Notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .select();
        
    if (error) throw error;
    return data;
};

// Export these functions
module.exports = {
    createNotification,
    findByUser,
    markRead,
    markAllRead
};