// frontend/src/pages/NotificationsPage.jsx
import { useState, useEffect } from 'react';
import { getNotifications, markAllAsRead, markAsRead } from '../api/notificationsApi';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all notifications when the page loads
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Error loading notifications:", error);
            } finally {
                setIsLoading(false); // Turn off the loading screen
            }
        };
        fetchNotifications();
    }, []);

    // Handle clicking the "Mark All as Read" button
    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            // Update the screen instantly so all backgrounds turn white
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    // Handle clicking a single notification to mark it read
    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your notifications...</div>;

    // This draws the full page on the screen
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            
            {/* Page Header and Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0 }}>Your Notifications</h2>
                <button 
                    onClick={handleMarkAllRead} 
                    style={{ 
                        padding: '10px 15px', backgroundColor: '#007bff', color: 'white', 
                        border: 'none', borderRadius: '5px', cursor: 'pointer' 
                    }}
                >
                    Mark All as Read
                </button>
            </div>

            {/* The List of Notifications */}
            <div style={{ marginTop: '20px' }}>
                {notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>You are all caught up! No notifications to show.</p>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            onClick={() => handleMarkRead(notif.id)} 
                            style={{
                                padding: '15px',
                                marginBottom: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                // Unread gets a blue tint, read gets white
                                backgroundColor: notif.is_read ? '#ffffff' : '#f0f8ff',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{notif.message}</p>
                            <small style={{ color: '#888' }}>
                                {new Date(notif.created_at).toLocaleString()}
                            </small>
                        </div>
                    ))
                )}
            </div>
            
        </div>
    );
};

export default NotificationsPage;