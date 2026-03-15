import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const s = io(window.location.origin, {
            transports: ['websocket', 'polling'],
        });

        s.on('connect', () => {
            s.emit('register', user.id);
        });

        s.on('notification', (notif) => {
            setNotifications((prev) => [notif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast(notif.message, {
                icon: '🔔',
                duration: 4000,
                style: {
                    background: '#16163a',
                    color: '#eaeaff',
                    border: '1px solid rgba(108, 92, 231, 0.3)',
                },
            });
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, [user]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await getNotifications();
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
    return ctx;
};
