import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('reconnect_token');
        const cached = localStorage.getItem('reconnect_user');

        if (token && cached) {
            setUser(JSON.parse(cached));
            // Refresh user data in background
            getMe()
                .then((res) => {
                    setUser(res.data.user);
                    localStorage.setItem('reconnect_user', JSON.stringify(res.data.user));
                })
                .catch(() => {
                    logout();
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const loginUser = (token, userData) => {
        localStorage.setItem('reconnect_token', token);
        localStorage.setItem('reconnect_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('reconnect_token');
        localStorage.removeItem('reconnect_user');
        setUser(null);
    };

    const updateUser = (userData) => {
        localStorage.setItem('reconnect_user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
