import { useState, useEffect } from 'react';
import { getNotifications, markAllAsRead, markAsRead } from '../../api/notificationsApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { theme } from '../../styles/theme';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchNotifications();
    };

    socket.on('notifications-updated', handleUpdate);
    socket.on('task-assigned', handleUpdate);
    socket.on('status-changed', handleUpdate);
    socket.on('comment-added', handleUpdate);
    socket.on('deadline-approaching', handleUpdate);
    socket.on('administrative-update', handleUpdate);
    socket.on('task-updated', handleUpdate);

    return () => {
      socket.off('notifications-updated', handleUpdate);
      socket.off('task-assigned', handleUpdate);
      socket.off('status-changed', handleUpdate);
      socket.off('comment-added', handleUpdate);
      socket.off('deadline-approaching', handleUpdate);
      socket.off('administrative-update', handleUpdate);
      socket.off('task-updated', handleUpdate);
    };
  }, [socket]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch {
      setError('Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map((n) =>
        n.notification_id === id ? { ...n, is_read: true } : n
      ));
    } catch {
      setError('Failed to mark as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <div style={s.loading}>Loading notifications...</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Notifications</h1>
          <p style={s.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button style={s.markAllBtn} onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button style={s.clearBtn} onClick={() => setNotifications([])}>
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <div style={s.alertError}>{error}</div>}

      <div style={s.list}>
        {notifications.length === 0 ? (
          <div style={s.empty}>No notifications yet.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.notification_id}
              style={{ ...s.item, ...(notif.is_read ? s.itemRead : s.itemUnread) }}
              onClick={() => !notif.is_read && handleMarkRead(notif.notification_id)}
            >
              <div style={s.itemLeft}>
                {!notif.is_read && <span style={s.unreadDot} />}
              </div>
              <div style={s.itemContent}>
                <p style={s.itemMessage}>{notif.message}</p>
                <span style={s.itemTime}>
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>
              {!notif.is_read && (
                <button
                  style={s.readBtn}
                  onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.notification_id); }}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' },
  title: { fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body, letterSpacing: '-0.01em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body },
  markAllBtn: { padding: '8px 16px', backgroundColor: theme.color.surface, color: theme.color.accent, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body, flexShrink: 0 },
  clearBtn: { padding: '8px 16px', backgroundColor: theme.color.surface, color: theme.color.inkSoft, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body, flexShrink: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  item: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, cursor: 'pointer' },
  itemUnread: { backgroundColor: theme.color.accentSoft, borderColor: `${theme.color.accent}30` },
  itemRead: { backgroundColor: theme.color.surface },
  itemLeft: { width: '12px', display: 'flex', justifyContent: 'center', flexShrink: 0 },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.color.accent, display: 'block' },
  itemContent: { flex: 1, minWidth: 0 },
  itemMessage: { fontSize: '14px', color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body, lineHeight: 1.5 },
  itemTime: { fontSize: '12px', color: theme.color.inkFaint, fontFamily: theme.font.mono },
  readBtn: { padding: '5px 11px', backgroundColor: 'transparent', color: theme.color.accent, border: `1px solid ${theme.color.accent}30`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, fontFamily: theme.font.body, flexShrink: 0 },
  empty: { padding: '48px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body, backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px dashed ${theme.color.border}` },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  loading: { textAlign: 'center', padding: '40px', color: theme.color.inkSoft, fontFamily: theme.font.body },
};

export default NotificationsPage;