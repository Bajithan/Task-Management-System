import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getNotifications, markAsRead } from '../../api/notificationsApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    
    const { socket, isConnected } = useWebSocket();

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e) => {
            const container = document.getElementById('notification-bell-container');
            if (container && !container.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (newNotif) => {
            setNotifications((prev) => [newNotif, ...prev]);
        };

        socket.on('task-assigned', handleNewNotification);
        socket.on('status-changed', handleNewNotification);
        socket.on('comment-added', handleNewNotification);
        socket.on('deadline-approaching', handleNewNotification);
        socket.on('administrative-update', handleNewNotification);
        socket.on('task-updated', handleNewNotification);
        
        socket.on('notifications-updated', () => {
            fetchNotifications();
        });
        
        socket.on('account-deactivated', (data) => {
            alert(data.message || 'Your account has been deactivated.');
            logout();
            navigate('/login');
        });
        
        socket.on('offline-notifications', (offlineNotifs) => {
            setNotifications((prev) => [...offlineNotifs, ...prev]);
        });

        return () => {
            socket.off('task-assigned');
            socket.off('status-changed');
            socket.off('comment-added');
            socket.off('deadline-approaching');
            socket.off('administrative-update');
            socket.off('task-updated');
            socket.off('notifications-updated');
            socket.off('account-deactivated');
            socket.off('offline-notifications');
        };
    }, [socket]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleNotificationClick = async (notifId) => {
        try {
            await markAsRead(notifId);
            setNotifications(notifications.map(n => 
                n.notification_id === notifId ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    return (
        <div id="notification-bell-container" style={{ position: 'relative', display: 'inline-block' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
                🔔
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
                                    key={notif.notification_id} 
                                    onClick={() => handleNotificationClick(notif.notification_id)}
                                    style={{ 
                                        padding: '10px', borderBottom: '1px solid #eee', 
                                        cursor: 'pointer', 
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