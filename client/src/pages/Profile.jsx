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
            setForm({ name: user.name, bio: user.bio || '', profilePicture: user.profilePicture || '' });
            getUserActivities(user.id).then((res) => setActivities(res.data.activities)).catch(() => { });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateProfile(form);
            updateUser(res.data.user);
            setEditing(false);
            toast.success('Profile updated');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>Profile</h2>
                <p className="subtitle">Manage your account</p>
            </div>

            <div className="card profile-card">
                <img
                    className="profile-avatar"
                    src={user?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name}`}
                    alt={user?.name}
                />

                {editing ? (
                    <div style={{ textAlign: 'left', maxWidth: 360, margin: '0 auto' }}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                rows={3}
                                maxLength={300}
                                placeholder="Tell people about yourself..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Avatar URL</label>
                            <input
                                type="text"
                                value={form.profilePicture}
                                onChange={(e) => setForm({ ...form, profilePicture: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h3 className="profile-name">{user?.name}</h3>
                        <p className="profile-email">{user?.email}</p>
                        {user?.bio && <p className="profile-bio">{user.bio}</p>}
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: 16 }}
                            onClick={() => setEditing(true)}
                        >
                            Edit Profile
                        </button>
                    </>
                )}
            </div>

            {activities.length > 0 && (
                <>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, letterSpacing: '-0.02em' }}>
                        Your Activities
                    </h3>
                    {activities.map((act) => (
                        <div key={act.id} className="card" style={{ marginBottom: 12, padding: 20 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4, letterSpacing: '-0.01em' }}>
                                {act.title}
                            </h4>
                            {act.description && (
                                <p style={{ fontSize: '0.85rem', color: 'rgba(245,245,247,0.65)', lineHeight: 1.5, marginBottom: 8 }}>
                                    {act.description}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'rgba(245,245,247,0.4)' }}>
                                {act.location && <span>📍 {act.location}</span>}
                                <span>🗓️ {formatDate(act.time)}</span>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default Profile;
