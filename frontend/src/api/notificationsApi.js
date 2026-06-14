// frontend/src/api/notificationsApi.js

// The address for your notifications backend
const API_URL = 'http://localhost:5000/api/notifications';

// Grab the user's secret token to prove they are logged in
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// 1. Fetch all notifications for the logged-in user
export const getNotifications = async () => {
    const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
};

// 2. Mark a single notification as read
export const markAsRead = async (notificationId) => {
    const response = await fetch(`${API_URL}/${notificationId}/read`, {
        method: 'PATCH', // We use PATCH because we are just updating a small piece of data
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return await response.json();
};

// 3. Mark all notifications as read at once
export const markAllAsRead = async () => {
    const response = await fetch(`${API_URL}/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return await response.json();
};