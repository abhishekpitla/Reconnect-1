import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getUserActivities } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', bio: '', profilePicture: '' });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || '',
            });
            loadActivities();
        }
    }, [user]);

    const loadActivities = async () => {
        try {
            const res = await getUserActivities(user.id);
            setActivities(res.data.activities);
        } catch {
            // ignore
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateProfile(form);
            updateUser(res.data.user);
            setEditing(false);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>My Profile</h2>
                {!editing ? (
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                        ✏️ Edit
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                            {loading ? '...' : '💾 Save'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="profile-header">
                    <img
                        className="profile-avatar"
                        src={user.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                        alt={user.name}
                    />
                    <div className="profile-info">
                        {editing ? (
                            <>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <textarea
                                        className="form-input"
                                        value={form.bio}
                                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                        style={{ minHeight: 80 }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.profilePicture}
                                        onChange={(e) => setForm({ ...form, profilePicture: e.target.value })}
                                        placeholder="Profile picture URL"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>{user.name}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
                                    {user.email}
                                </p>
                                <p className="bio">{user.bio || 'No bio yet...'}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>
                My Activities ({activities.length})
            </h3>

            {activities.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📝</div>
                    <h3>No activities posted</h3>
                    <p>Share your first activity to start reconnecting!</p>
                </div>
            ) : (
                activities.map((act) => (
                    <div key={act.id} className="card" style={{ marginBottom: 12, padding: 16 }}>
                        <h4 style={{ marginBottom: 4 }}>{act.title}</h4>
                        {act.description && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                                {act.description}
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {act.location && <span>📍 {act.location}</span>}
                            <span>🗓️ {new Date(act.time).toLocaleDateString()}</span>
                            <span>{act.audience === 'public' ? '🌍 Public' : '👥 Friends'}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Profile;
