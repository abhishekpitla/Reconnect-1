import { useNotifications } from '../context/NotificationContext';

const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Notifications = () => {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'engagement': return '❤️';
            case 'new_activity': return '📢';
            case 'connection_request': return '🤝';
            case 'connection_accepted': return '🎉';
            default: return '🔔';
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h2>Notifications</h2>
                    <p className="subtitle">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
                        ✓ Mark all read
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🔔</div>
                        <h3>No notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`notification-item ${!notif.read ? 'unread' : ''}`}
                            onClick={() => !notif.read && markRead(notif.id)}
                        >
                            <div style={{ fontSize: '1.3rem', marginTop: 2 }}>
                                {getIcon(notif.type)}
                            </div>
                            {notif.relatedUserId?.profilePicture && (
                                <img
                                    src={notif.relatedUserId.profilePicture}
                                    alt=""
                                    style={{ width: 36, height: 36, borderRadius: '50%' }}
                                />
                            )}
                            <div className="notification-content">
                                <p>{notif.message}</p>
                                <span className="time">{formatTime(notif.createdAt)}</span>
                            </div>
                            {!notif.read && <div className="notification-dot"></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
