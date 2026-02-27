import { useNotifications } from '../context/NotificationContext';

const formatDate = (date) => {
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

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2>Notifications</h2>
                    <p className="subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">◎</div>
                    <h3>No notifications</h3>
                    <p>You're all caught up!</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`notification-item ${!notif.read ? 'unread' : ''}`}
                            onClick={() => !notif.read && markRead(notif.id)}
                        >
                            <img
                                className="notification-avatar"
                                src={
                                    notif.relatedUser?.profilePicture ||
                                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${notif.relatedUser?.name}`
                                }
                                alt=""
                            />
                            <div className="notification-content">
                                <div className="notification-message">{notif.message}</div>
                                <div className="notification-time">{formatDate(notif.createdAt)}</div>
                            </div>
                            {!notif.read && <div className="notification-dot" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
