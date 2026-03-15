import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, signup } from '../services/api';
import toast from 'react-hot-toast';
import obsidianHero from '../assets/obsidian.png';

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
            toast.success(isSignup ? 'Admission Granted.' : 'Welcome to the Assembly.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Access Denied');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-image fade-in">
                <img src={obsidianHero} alt="Obsidian Rock" className="obsidian-hero" />
            </div>

            <div className="auth-card fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="auth-header">
                    <h1>{isSignup ? 'Seek Admission' : 'Nothing Shown First'}</h1>
                    <p>{isSignup ? 'Join The Obsidian Assembly' : 'Commitment Precedes Entry'}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

                    {isSignup && (
                        <div className="form-group">
                            <label>Designation</label>
                            <input
                                type="text"
                                placeholder="Your full name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Coordinates (Email)</label>
                        <input
                            type="email"
                            placeholder="name@domain.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Passphrase</label>
                        <input
                            type="password"
                            placeholder="Enter sequence"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'Authenticating...' : isSignup ? 'Submit Application' : 'Enter'}
                    </button>
                </form>

                <div className="auth-footer">
                    {isSignup ? 'Already a member? ' : "Not yet inducted? "}
                    <button onClick={() => { setIsSignup(!isSignup); setError(''); }} type="button">
                        {isSignup ? 'Sign In' : 'Seek Admission'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
