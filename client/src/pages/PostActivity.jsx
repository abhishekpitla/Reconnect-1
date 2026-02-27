import { useState } from 'react';
import { createActivity } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PostActivity = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '', description: '', location: '', time: '', audience: 'friends',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createActivity(form);
            toast.success('Activity posted!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>Post Activity</h2>
                <p className="subtitle">Let your network know what you're up to</p>
            </div>

            <div className="card" style={{ padding: 28 }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            placeholder="What are you planning?"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Share the details..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                placeholder="Where?"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date & Time</label>
                            <input
                                type="datetime-local"
                                value={form.time}
                                onChange={(e) => setForm({ ...form, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Audience</label>
                        <select
                            value={form.audience}
                            onChange={(e) => setForm({ ...form, audience: e.target.value })}
                        >
                            <option value="friends">👥 Friends only</option>
                            <option value="public">🌍 Public</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Activity'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostActivity;
