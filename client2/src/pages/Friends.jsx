import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    searchUsers, sendConnectionRequest, getFriends,
    getPendingRequests, acceptConnection, removeConnection
} from '../services/api';
import toast from 'react-hot-toast';

const Friends = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('friends');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [sent, setSent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [f, p] = await Promise.all([getFriends(), getPendingRequests()]);
            setFriends(f.data.friends || []);
            const pendingReqs = p.data.requests || [];
            setIncoming(pendingReqs.filter(r => r.recipientId === user.id));
            setSent(pendingReqs.filter(r => r.requesterId === user.id));
        } catch { toast.error('Failed to load connections'); }
        finally { setLoading(false); }
    };

    const handleSearch = async (q) => {
        setSearch(q);
        if (q.length < 2) { setSearchResults([]); return; }
        try {
            const res = await searchUsers(q);
            setSearchResults(res.data.users.filter(u => u.id !== user.id));
        } catch { }
    };

    const handleConnect = async (userId) => {
        try { await sendConnectionRequest(userId); toast.success('Request sent!'); setSearchResults(r => r.filter(u => u.id !== userId)); loadData(); }
        catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    };

    const handleAccept = async (id) => {
        try { await acceptConnection(id); toast.success('Accepted!'); loadData(); }
        catch { toast.error('Failed'); }
    };

    const handleRemove = async (id) => {
        try { await removeConnection(id); toast.success('Removed'); loadData(); }
        catch { toast.error('Failed'); }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            {/* ── Visual Header ── */}
            <div className="connections-hero">
                <div className="connections-hero-content">
                    <h2 className="connections-hero-title">Your Circle</h2>
                    <p className="connections-hero-subtitle">The people who make life interesting</p>
                </div>
                <div className="connections-stats-row">
                    <div className="connections-stat">
                        <span className="connections-stat-num">{friends.length}</span>
                        <span className="connections-stat-label">friends</span>
                    </div>
                    <div className="connections-stat">
                        <span className="connections-stat-num">{incoming.length}</span>
                        <span className="connections-stat-label">incoming</span>
                    </div>
                    <div className="connections-stat">
                        <span className="connections-stat-num">{sent.length}</span>
                        <span className="connections-stat-label">pending</span>
                    </div>
                </div>
            </div>

            {/* ── Search ── */}
            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input placeholder="Search people to connect with..." value={search} onChange={e => handleSearch(e.target.value)} />
            </div>

            {searchResults.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <h3 className="section-title-sm">Search Results</h3>
                    <div className="search-results">
                        {searchResults.map(u => (
                            <div key={u.id} className="search-result-item">
                                <img src={u.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.name}`} alt={u.name} />
                                <div className="info">
                                    <h4>{u.name}</h4>
                                    <p>{u.bio || u.email}</p>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleConnect(u.id)}>Connect</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Tabs ── */}
            <div className="tabs">
                {['friends', 'incoming', 'sent'].map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t === 'friends' ? `Friends (${friends.length})` : t === 'incoming' ? `Incoming (${incoming.length})` : `Sent (${sent.length})`}
                    </button>
                ))}
            </div>

            {/* ── Friends Grid ── */}
            {tab === 'friends' && (
                friends.length === 0 ? (
                    <div className="empty-state">
                        <img src="/images/wave.png" alt="" style={{ width: 100, marginBottom: 16, borderRadius: 16, opacity: 0.7 }} />
                        <h3>No connections yet</h3>
                        <p>Search for people above to start building your circle</p>
                    </div>
                ) : (
                    <div className="friends-grid">
                        {friends.map((f, i) => (
                            <div key={f.id} className="card friend-card-rich" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="friend-card-accent" />
                                <img src={f.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${f.name}`} alt={f.name} />
                                <div className="friend-info">
                                    <h4>{f.name}</h4>
                                    <p>{f.bio || f.email}</p>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(f.connectionId)} title="Remove" style={{ opacity: 0.4 }}>✕</button>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* ── Incoming ── */}
            {tab === 'incoming' && (
                incoming.length === 0 ? (
                    <div className="empty-state"><h3>No incoming requests</h3><p>Check back later</p></div>
                ) : (
                    <div className="request-list">
                        {incoming.map(req => (
                            <div key={req.id} className="card request-card">
                                <img src={req.requester?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.requester?.name}`} alt={req.requester?.name} />
                                <div style={{ flex: 1 }}>
                                    <h4>{req.requester?.name}</h4>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{req.requester?.email}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAccept(req.id)}>Accept</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(req.id)}>Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* ── Sent ── */}
            {tab === 'sent' && (
                sent.length === 0 ? (
                    <div className="empty-state"><h3>No pending requests</h3><p>Search above to connect with people</p></div>
                ) : (
                    <div className="request-list">
                        {sent.map(req => (
                            <div key={req.id} className="card request-card">
                                <img src={req.recipient?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.recipient?.name}`} alt={req.recipient?.name} />
                                <div style={{ flex: 1 }}>
                                    <h4>{req.recipient?.name}</h4>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{req.recipient?.email}</p>
                                </div>
                                <span className="pending-badge">⏳ Pending</span>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default Friends;
