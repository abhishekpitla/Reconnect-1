import { useState, useEffect } from 'react';
import { getPendingInvites, respondToInvite } from '../services/api';
import toast from 'react-hot-toast';

const Invites = () => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvites();
    }, []);

    const loadInvites = async () => {
        try {
            const res = await getPendingInvites();
            setInvites(res.data.invites);
        } catch (err) {
            toast.error('Failed to load invites');
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (id, status) => {
        try {
            await respondToInvite(id, status);
            toast.success(`Request ${status}`);
            setInvites(invites.filter(i => i.id !== id));
        } catch (err) {
            toast.error('Failed to respond to request');
        }
    };

    if (loading) return <div className="loading">Loading invites...</div>;

    return (
        <div className="invites-page container fade-in">
            <header className="page-header">
                <h1>Join Requests</h1>
                <p>People who want to join your activities</p>
            </header>

            {invites.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📂</div>
                    <h3>No pending requests</h3>
                    <p>When someone wants to join your activity, they'll show up here.</p>
                </div>
            ) : (
                <div className="invites-list">
                    {invites.map((invite) => (
                        <div key={invite.id} className="invite-card">
                            <div className="invite-user">
                                <img src={invite.user.profilePicture || 'https://via.placeholder.com/50'} alt={invite.user.name} />
                                <div>
                                    <h3>{invite.user.name}</h3>
                                    <p>wants to join <strong>{invite.activity.title}</strong></p>
                                </div>
                            </div>
                            <div className="invite-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleResponse(invite.id, 'accepted')}
                                >
                                    Accept
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleResponse(invite.id, 'declined')}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Invites;
