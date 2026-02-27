import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PostActivity from './pages/PostActivity';
import Friends from './pages/Friends';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Invites from './pages/Invites';
import ChatRoom from './components/ChatRoom';
import './index.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    return user ? children : <Navigate to="/login" />;
};

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const links = [
        { to: '/', icon: '◉', label: 'Feed' },
        { to: '/post', icon: '✦', label: 'Post Activity' },
        { to: '/invites', icon: '📩', label: 'Join Requests' },
        { to: '/friends', icon: '⊕', label: 'Connections' },
        { to: '/notifications', icon: '◎', label: 'Notifications', badge: unreadCount },
        { to: '/profile', icon: '◐', label: 'Profile' },
    ];

    return (
        <>
            {/* Mobile header */}
            <div className="mobile-header">
                <div className="mobile-header-brand">
                    <div className="sidebar-logo" style={{ width: 28, height: 28, fontSize: 14 }}>🔗</div>
                    Reconnect
                </div>
                <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Overlay */}
            <div
                className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">🔗</div>
                    <span className="sidebar-brand">Reconnect</span>
                </div>

                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/'}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            {link.label}
                            {link.badge > 0 && <span className="nav-badge">{link.badge}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-user">
                    <img
                        src={user?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name}`}
                        alt={user?.name}
                    />
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className="sidebar-user-email">{user?.email}</div>
                    </div>
                    <button className="logout-btn" onClick={logout} title="Sign out">⏻</button>
                </div>
            </aside>
        </>
    );
};

const AppLayout = ({ children }) => (
    <div className="app-container">
        <Sidebar />
        <main className="main-content">
            {children}
        </main>
    </div>
);

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <NotificationProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1c1c1e',
                            color: '#f5f5f7',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            backdropFilter: 'blur(20px)',
                        },
                    }}
                />
                <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                    <Route path="/post" element={<ProtectedRoute><AppLayout><PostActivity /></AppLayout></ProtectedRoute>} />
                    <Route path="/friends" element={<ProtectedRoute><AppLayout><Friends /></AppLayout></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
                    <Route path="/invites" element={<ProtectedRoute><AppLayout><Invites /></AppLayout></ProtectedRoute>} />
                    <Route path="/chat/:activityId" element={<ProtectedRoute><AppLayout><ChatRoom /></AppLayout></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </NotificationProvider>
        </AuthProvider>
    </BrowserRouter>
);

export default App;
