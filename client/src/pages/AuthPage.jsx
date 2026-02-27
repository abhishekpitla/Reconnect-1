import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, signup } from '../services/api';
import toast from 'react-hot-toast';

const AuthPage = () => {
    const location = useLocation();
    const [isSignup, setIsSignup] = useState(location.pathname === '/signup');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = isSignup ? await signup(form) : await login({ email: form.email, password: form.password });
            loginUser(res.data.token, res.data.user);
            toast.success(isSignup ? 'Welcome to Reconnect!' : 'Welcome back!');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <div className="auth-logo">🔗</div>
                    <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
                    <p>{isSignup ? 'Start reconnecting with people' : 'Sign in to your account'}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

                    {isSignup && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Your name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="6+ characters"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                    <button onClick={() => { setIsSignup(!isSignup); setError(''); }}>
                        {isSignup ? 'Sign In' : 'Create Account'}
                    </button>
                </div>

                <div className="demo-hint">
                    <strong>Demo Accounts</strong>
                    <p>alex@reconnect.app / password123<br />maya@reconnect.app / password123</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
