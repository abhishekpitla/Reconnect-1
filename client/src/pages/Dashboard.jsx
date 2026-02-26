import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed, toggleEngagement, getActivityEngagements } from '../services/api';
import toast from 'react-hot-toast';

const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatActivityTime = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const Dashboard = () => {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [engagements, setEngagements] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchFeed = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getFeed(page);
            setActivities(res.data.activities);
            setPagination(res.data.pagination);

            // Fetch engagements for each activity
            const engMap = {};
            await Promise.all(
                res.data.activities.map(async (act) => {
                    try {
                        const engRes = await getActivityEngagements(act.id);
                        engMap[act.id] = engRes.data;
                    } catch {
                        engMap[act.id] = { interested: { count: 0, users: [] }, me_too: { count: 0, users: [] } };
                    }
                })
            );
            setEngagements(engMap);
        } catch (err) {
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const handleEngage = async (activityId, type) => {
        try {
            await toggleEngagement(activityId, type);
            // Refresh engagements for this activity
            const engRes = await getActivityEngagements(activityId);
            setEngagements((prev) => ({ ...prev, [activityId]: engRes.data }));
        } catch (err) {
            toast.error('Failed to engage');
        }
    };

    const isUserEngaged = (activityId, type) => {
        const eng = engagements[activityId];
        if (!eng) return false;
        const list = type === 'interested' ? eng.interested.users : eng.me_too.users;
        return list.some((e) => (e.user?.id || e.userId) === user.id);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h2>Activity Feed</h2>
                    <p className="subtitle">Stay connected with your network</p>
                </div>
            </div>

            {activities.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📡</div>
                    <h3>No activities yet</h3>
                    <p>Start by posting an activity or connecting with people!</p>
                </div>
            ) : (
                activities.map((act) => {
                    const eng = engagements[act.id] || {
                        interested: { count: 0 },
                        me_too: { count: 0 },
                    };
                    return (
                        <div key={act.id} className="card activity-card">
                            <div className="activity-header">
                                <img
                                    src={act.user?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${act.user?.name}`}
                                    alt={act.user?.name}
                                />
                                <div className="activity-header-info">
                                    <h3>{act.user?.name}</h3>
                                    <span className="time">{formatDate(act.createdAt)}</span>
                                </div>
                                <span
                                    style={{
                                        marginLeft: 'auto',
                                        fontSize: '0.75rem',
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        background: act.audience === 'public' ? 'rgba(0, 206, 201, 0.15)' : 'rgba(108, 92, 231, 0.15)',
                                        color: act.audience === 'public' ? '#00cec9' : '#a29bfe',
                                    }}
                                >
                                    {act.audience === 'public' ? '🌍 Public' : '👥 Friends'}
                                </span>
                            </div>

                            <h3 className="activity-title">{act.title}</h3>
                            {act.description && <p className="activity-desc">{act.description}</p>}

                            <div className="activity-meta">
                                {act.location && (
                                    <span className="activity-meta-item">📍 {act.location}</span>
                                )}
                                <span className="activity-meta-item">🗓️ {formatActivityTime(act.time)}</span>
                            </div>

                            <div className="activity-actions">
                                <button
                                    className={`action-btn ${isUserEngaged(act.id, 'interested') ? 'active' : ''}`}
                                    onClick={() => handleEngage(act.id, 'interested')}
                                >
                                    ✨ Interested <span className="count">{eng.interested?.count || 0}</span>
                                </button>
                                <button
                                    className={`action-btn ${isUserEngaged(act.id, 'me_too') ? 'active' : ''}`}
                                    onClick={() => handleEngage(act.id, 'me_too')}
                                >
                                    🙋 Me Too! <span className="count">{eng.me_too?.count || 0}</span>
                                </button>
                            </div>
                        </div>
                    );
                })
            )}

            {pagination && pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                    {Array.from({ length: pagination.pages }, (_, i) => (
                        <button
                            key={i}
                            className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
