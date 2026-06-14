// frontend/src/components/notifications/NotificationBell.jsx
import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getNotifications, markAsRead } from '../../api/notificationsApi';

const NotificationBell = () => {
    // 1. Set up our memory for the notifications and if the dropdown is open
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    
    // 2. Plug into the live WebSocket tube we built earlier!
    const { socket, isConnected } = useWebSocket();

    // 3. Fetch the historical notifications when the bell first loads on the screen
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchNotifications();
    }, []);

    // 4. Listen to the live WebSocket for brand new notifications
    useEffect(() => {
        if (!socket) return;

        // This is the instruction for what to do when a message comes through the tube
        const handleNewNotification = (newNotif) => {
            // Add the brand new notification to the very top of our list
            setNotifications((prev) => [newNotif, ...prev]);
        };

        // Listen for the specific events your project plan required
        socket.on('task-assigned', handleNewNotification);
        socket.on('status-changed', handleNewNotification);
        socket.on('comment-added', handleNewNotification);
        socket.on('deadline-approaching', handleNewNotification);
        
        // Listen for any offline messages the server saved for us
        socket.on('offline-notifications', (offlineNotifs) => {
            setNotifications((prev) => [...offlineNotifs, ...prev]);
        });

        // Cleanup rule for when the user leaves the website
        return () => {
            socket.off('task-assigned');
            socket.off('status-changed');
            socket.off('comment-added');
            socket.off('deadline-approaching');
            socket.off('offline-notifications');
        };
    }, [socket]);

    // Calculate how many notifications are currently unread
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // 5. Handle what happens when the user clicks a specific notification
    const handleNotificationClick = async (notifId) => {
        try {
            await markAsRead(notifId);
            // Update our list to visually show it as read immediately
            // FIXED: Changed n.id to n.notification_id
            setNotifications(notifications.map(n => 
                n.notification_id === notifId ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    // 6. This draws the Bell icon and the Dropdown menu on the screen
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* The Bell Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
                🔔
                {/* Only show the red dot if there is an unread message */}
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '0', right: '0', 
                        backgroundColor: 'red', color: 'white', 
                        borderRadius: '50%', padding: '2px 6px', 
                        fontSize: '12px', fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* The Dropdown Menu (Only visible if isOpen is true) */}
            {isOpen && (
                <div style={{
                    position: 'absolute', right: '0', top: '40px',
                    width: '300px', backgroundColor: 'white', 
                    border: '1px solid #ccc', borderRadius: '5px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', zIndex: 1000,
                    maxHeight: '400px', overflowY: 'auto'
                }}>
                    <h4 style={{ margin: '0', padding: '10px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                        Notifications {isConnected ? '🟢' : '🔴'}
                    </h4>
                    
                    {notifications.length === 0 ? (
                        <p style={{ padding: '15px', textAlign: 'center', color: 'gray' }}>No notifications yet.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: '0', padding: '0' }}>
                            {notifications.map((notif) => (
                                <li 
                                    // FIXED: Changed notif.id to notif.notification_id
                                    key={notif.notification_id} 
                                    onClick={() => handleNotificationClick(notif.notification_id)}
                                    style={{ 
                                        padding: '10px', borderBottom: '1px solid #eee', 
                                        cursor: 'pointer', 
                                        // Unread messages get a light blue background, read messages are white
                                        backgroundColor: notif.is_read ? 'white' : '#e6f7ff' 
                                    }}
                                >
                                    <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{notif.message}</p>
                                    <small style={{ color: 'gray' }}>{new Date(notif.created_at).toLocaleString()}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;