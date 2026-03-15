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
                <p className="subtitle">{friends.length} individuals in network</p>
            </div>

            <div className="search-bar">
                <span className="search-icon">//</span>
                <input
                    type="text"
                    placeholder="Search directory..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {searchResults.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 500, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        Directory Results
                    </h3>
                    <div className="search-results" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {searchResults.map((u) => (
                            <div key={u.id} className="search-result-item" style={{ border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                                <img
                                    src={u.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.name}`}
                                    alt={u.name}
                                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div className="info">
                                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</h4>
                                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: '4px' }}>{u.email}</p>
                                </div>
                                <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleConnect(u.id)}>
                                    Request Admission
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="tabs" style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
                <button className={`tab ${tab === 'friends' ? 'active' : ''}`} style={{ background: 'none', border: 'none', borderBottom: tab === 'friends' ? '1px solid var(--text-primary)' : '1px solid transparent', padding: '0 0 12px 0', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: tab === 'friends' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setTab('friends')}>
                    Network ({friends.length})
                </button>
                <button className={`tab ${tab === 'incoming' ? 'active' : ''}`} style={{ background: 'none', border: 'none', borderBottom: tab === 'incoming' ? '1px solid var(--text-primary)' : '1px solid transparent', padding: '0 0 12px 0', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: tab === 'incoming' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setTab('incoming')}>
                    Incoming ({incoming.length})
                </button>
                <button className={`tab ${tab === 'outgoing' ? 'active' : ''}`} style={{ background: 'none', border: 'none', borderBottom: tab === 'outgoing' ? '1px solid var(--text-primary)' : '1px solid transparent', padding: '0 0 12px 0', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: tab === 'outgoing' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setTab('outgoing')}>
                    Sent ({outgoing.length})
                </button>
            </div>

            {tab === 'friends' && (
                <div className="friends-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {friends.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '80px 0', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <div className="icon" style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '16px' }}>Empty</div>
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-primary)' }}>No connections active</h3>
                        </div>
                    ) : friends.map((f) => (
                        <div key={f.id} className="card friend-card" style={{ border: '1px solid var(--border)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                            <img
                                src={f.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${f.name}`}
                                alt={f.name}
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '24px' }}
                            />
                            <div className="friend-info">
                                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 500, color: 'var(--text-primary)' }}>{f.name}</h4>
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.6' }}>{f.bio || f.email}</p>
                            </div>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleRemove(f.connectionId)}
                                title="Remove connection"
                                style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.65rem', padding: '4px 8px' }}
                            >
                                [REMOVE]
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'incoming' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {incoming.length === 0 ? (
                        <div className="empty-state" style={{ padding: '80px 0', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <div className="icon" style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '16px' }}>None</div>
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-primary)' }}>No pending requests</h3>
                        </div>
                    ) : incoming.map((req) => (
                        <div key={req.id} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', border: '1px solid var(--border)' }}>
                            <img
                                src={req.requester?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.requester?.name}`}
                                alt={req.requester?.name}
                                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontStyle: 'italic', fontWeight: 500, color: 'var(--text-primary)' }}>{req.requester?.name}</h4>
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: '4px' }}>{req.requester?.email}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="action-btn active" onClick={() => handleAccept(req.id)}>Accept</button>
                                <button className="action-btn" onClick={() => handleRemove(req.id)}>Decline</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'outgoing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {outgoing.length === 0 ? (
                        <div className="empty-state" style={{ padding: '80px 0', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <div className="icon" style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '16px' }}>None</div>
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-primary)' }}>No sent requests</h3>
                        </div>
                    ) : outgoing.map((req) => (
                        <div key={req.id} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', border: '1px solid var(--border)' }}>
                            <img
                                src={req.recipient?.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.recipient?.name}`}
                                alt={req.recipient?.name}
                                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontStyle: 'italic', fontWeight: 500, color: 'var(--text-primary)' }}>{req.recipient?.name}</h4>
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: '4px' }}>{req.recipient?.email}</p>
                            </div>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', padding: '8px 16px', border: '1px solid var(--border)' }}>
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
