import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActivity } from '../services/api';
import toast from 'react-hot-toast';

const PostActivity = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        location: '',
        time: '',
        audience: 'friends',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.time) {
            toast.error('Title and time are required');
            return;
        }

        setLoading(true);
        try {
            await createActivity({
                ...form,
                time: new Date(form.time).toISOString(),
            });
            toast.success('Activity posted! 🎉');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to post activity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h2>Post Activity</h2>
                    <p className="subtitle">Broadcast what you're up to</p>
                </div>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Activity Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Weekend Hiking Trip"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="form-input"
                            placeholder="Tell people more about this activity..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            maxLength={1000}
                            rows={4}
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Central Park, NYC"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            maxLength={200}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label>Date & Time *</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={form.time}
                                onChange={(e) => setForm({ ...form, time: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Audience</label>
                            <select
                                className="form-input"
                                value={form.audience}
                                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                            >
                                <option value="friends">👥 Friends Only</option>
                                <option value="public">🌍 Public</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Posting...' : '📢 Post Activity'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostActivity;
