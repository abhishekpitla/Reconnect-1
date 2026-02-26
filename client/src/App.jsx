import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import PostActivity from './pages/PostActivity';
import Notifications from './pages/Notifications';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="loading" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }
    return user ? children : <Navigate to="/login" />;
};

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">🔗</div>
                <h1>Reconnect</h1>
            </div>

            <div className="sidebar-nav">
                <NavLink
                    to="/"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    end
                >
                    <span className="icon">🏠</span>
                    <span>Feed</span>
                </NavLink>

                <NavLink
                    to="/post"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    <span className="icon">📢</span>
                    <span>Post Activity</span>
                </NavLink>

                <NavLink
                    to="/friends"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    <span className="icon">👥</span>
                    <span>Connections</span>
                </NavLink>

                <NavLink
                    to="/notifications"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    <span className="icon">🔔</span>
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    <span className="icon">👤</span>
                    <span>Profile</span>
                </NavLink>
            </div>

            <div className="sidebar-user">
                <img
                    src={user.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                />
                <div className="sidebar-user-info">
                    <div className="name">{user.name}</div>
                    <div className="email">{user.email}</div>
                </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
                <span className="icon">🚪</span>
                <span>Logout</span>
            </button>
        </nav>
    );
};

const AppLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/login" element={<AuthPage mode="login" />} />
                        <Route path="/signup" element={<AuthPage mode="signup" />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <AppLayout><Dashboard /></AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/post"
                            element={
                                <ProtectedRoute>
                                    <AppLayout><PostActivity /></AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/friends"
                            element={
                                <ProtectedRoute>
                                    <AppLayout><Friends /></AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <AppLayout><Notifications /></AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <AppLayout><Profile /></AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
