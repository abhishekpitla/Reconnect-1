import { useState, useEffect } from 'react';
import {
    getFriends,
    getPendingRequests,
    acceptConnection,
    removeConnection,
    searchUsers,
    sendConnectionRequest,
} from '../services/api';
import toast from 'react-hot-toast';

const Friends = () => {
    const [tab, setTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [friendsRes, pendingRes] = await Promise.all([
                getFriends(),
                getPendingRequests(),
            ]);
            setFriends(friendsRes.data.friends);
            setIncoming(pendingRes.data.incoming);
            setOutgoing(pendingRes.data.outgoing);
        } catch {
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) { setSearchResults([]); return; }
        try {
            const res = await searchUsers(q);
            setSearchResults(res.data.users);
        } catch { }
    };

    const handleConnect = async (userId) => {
        try {
            await sendConnectionRequest(userId);
            toast.success('Connection request sent!');
            setSearchResults((prev) => prev.filter((u) => u.id !== userId));
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send request');
        }
    };

    const handleAccept = async (connectionId) => {
        try {
            await acceptConnection(connectionId);
            toast.success('Connection accepted!');
            loadData();
        } catch { toast.error('Failed to accept'); }
    };

    const handleRemove = async (connectionId) => {
        try {
            await removeConnection(connectionId);
            toast.success('Connection removed');
            loadData();
        } catch { toast.error('Failed to remove'); }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>Connections</h2>
                <p className="subtitle">{friends.length} friends connected</p>
            </div>

            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search people to connect with..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {searchResults.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-dark-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Search Results
                    </h3>
                    <div className="search-results">
                        {searchResults.map((u) => (
                            <div key={u.id} className="search-result-item">
                                <img
                                    src={u.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.name}`}
                                    alt={u.name}
                                />
                                <div className="info">
                                    <h4>{u.name}</h4>
                                    <p>{u.email}</p>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleConnect(u.id)}>
                                    Connect
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="tabs">
                <button className={`tab ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
                    Friends ({friends.length})
                </button>
                <button className={`tab ${tab === 'incoming' ? 'active' : ''}`} onClick={() => setTab('incoming')}>
                    Incoming ({incoming.length})
                </button>
                <button className={`tab ${tab === 'outgoing' ? 'active' : ''}`} onClick={() => setTab('outgoing')}>
                    Sent ({outgoing.length})
                </button>
            </div>

            {tab === 'friends' && (
                <div className="friends-grid">
                    {friends.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">👥</div>
                            <h3>No connections yet</h3>
                            <p>Search for people above to start connecting!</p>
                        </div>
                    ) : friends.map((f) => (
                        <div key={f.id} className="card friend-card">
                            <img
                                src={f.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${f.name}`}
                                alt={f.name}
                            />
                            <div className="friend-info">
                                <h4>{f.name}</h4>
                                <p>{f.bio || f.email}</p>
                            </div>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleRemove(f.connectionId)}
                                title="Remove connection"
                                style={{ color: 'var(--text-light-muted)' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'incoming' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {incoming.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📩</div>
                            <h3>No pending requests</h3>
                        </div>
                    ) : incoming.map((req) => (
                        <div key={req.id} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                                src={req.requester?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.requester?.name}`}
                                alt={req.requester?.name}
                                style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-light)' }}>{req.requester?.name}</h4>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)' }}>{req.requester?.email}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleAccept(req.id)}>Accept</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(req.id)} style={{ color: 'var(--text-light-muted)' }}>Decline</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'outgoing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {outgoing.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📤</div>
                            <h3>No sent requests</h3>
                        </div>
                    ) : outgoing.map((req) => (
                        <div key={req.id} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                                src={req.recipient?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.recipient?.name}`}
                                alt={req.recipient?.name}
                                style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-light)' }}>{req.recipient?.name}</h4>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)' }}>{req.recipient?.email}</p>
                            </div>
                            <span style={{
                                fontSize: '0.78rem', color: 'var(--warning)', background: 'var(--warning-subtle)',
                                padding: '4px 14px', borderRadius: 'var(--radius-full)', fontWeight: 600,
                            }}>
                                Pending
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Friends;
