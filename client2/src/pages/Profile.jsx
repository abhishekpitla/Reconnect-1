import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getUserActivities, getFriends } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', bio: '', profilePicture: '' });
    const [activities, setActivities] = useState([]);
    const [friendCount, setFriendCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ name: user.name, bio: user.bio || '', profilePicture: user.profilePicture || '' });
            getUserActivities(user.id).then((res) => setActivities(res.data.activities)).catch(() => { });
            getFriends().then((res) => setFriendCount(res.data.friends?.length || 0)).catch(() => { });
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

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    return (
        <div className="fade-in">
            {/* ── Hero Banner ── */}
            <div className="profile-banner">
                <div className="profile-banner-gradient" />
                <div className="profile-banner-content">
                    <img
                        className="profile-avatar-lg"
                        src={user?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name}`}
                        alt={user?.name}
                    />
                    <div className="profile-hero-info">
                        <h1 className="profile-display-name">{user?.name}</h1>
                        <p className="profile-handle">{user?.email}</p>
                        {user?.bio && <p className="profile-bio-hero">{user.bio}</p>}
                    </div>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="profile-stats">
                <div className="stat-card">
                    <span className="stat-number">{activities.length}</span>
                    <span className="stat-label">Activities</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{friendCount}</span>
                    <span className="stat-label">Connections</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{memberSince}</span>
                    <span className="stat-label">Member since</span>
                </div>
            </div>

            {/* ── Edit Section ── */}
            {editing ? (
                <div className="card" style={{ marginBottom: 32 }}>
                    <h3 className="section-title">Edit Profile</h3>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={300} placeholder="Tell people about yourself..." />
                    </div>
                    <div className="form-group">
                        <label>Avatar URL</label>
                        <input type="text" value={form.profilePicture} onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} placeholder="https://..." />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <button className="btn btn-secondary" style={{ marginBottom: 32 }} onClick={() => setEditing(true)}>
                    ✏️ Edit Profile
                </button>
            )}

            {/* ── Activity Timeline ── */}
            {activities.length > 0 && (
                <>
                    <h3 className="section-title">Your Activities</h3>
                    <div className="activity-timeline">
                        {activities.map((act, i) => (
                            <div key={act.id} className="timeline-item" style={{ animationDelay: `${i * 0.06}s` }}>
                                <div className="timeline-dot" />
                                <div className="timeline-card">
                                    <h4 className="timeline-title">{act.title}</h4>
                                    {act.description && <p className="timeline-desc">{act.description}</p>}
                                    <div className="timeline-meta">
                                        {act.location && <span>📍 {act.location}</span>}
                                        <span>🗓️ {formatDate(act.time)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;
