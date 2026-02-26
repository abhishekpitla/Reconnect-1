import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, signup } from '../services/api';
import toast from 'react-hot-toast';

const AuthPage = ({ mode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = isLogin
                ? await login({ email: form.email, password: form.password })
                : await signup(form);

            loginUser(res.data.token, res.data.user);
            toast.success(isLogin ? 'Welcome back!' : 'Account created!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                            borderRadius: 16,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28,
                            marginBottom: 16,
                            boxShadow: '0 0 30px rgba(108, 92, 231, 0.3)',
                        }}
                    >
                        🔗
                    </div>
                </div>
                <h2 style={{ textAlign: 'center' }}>
                    {isLogin ? 'Welcome Back' : 'Join Reconnect'}
                </h2>
                <p className="subtitle" style={{ textAlign: 'center' }}>
                    {isLogin
                        ? 'Sign in to reconnect with your people'
                        : 'Start broadcasting activities & find lost connections'}
                </p>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Alex Johnson"
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
                            className="form-input"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                        style={{ marginTop: 8 }}
                    >
                        {loading ? '...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p
                    style={{
                        textAlign: 'center',
                        marginTop: 24,
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                    }}
                >
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <span
                        style={{
                            color: 'var(--accent-light)',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setForm({ name: '', email: '', password: '' });
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </span>
                </p>

                <div
                    style={{
                        marginTop: 24,
                        padding: '12px 16px',
                        background: 'var(--bg-input)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    <strong style={{ color: 'var(--text-secondary)' }}>Demo accounts:</strong>
                    <br />
                    alex@reconnect.app / password123
                    <br />
                    maya@reconnect.app / password123
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
