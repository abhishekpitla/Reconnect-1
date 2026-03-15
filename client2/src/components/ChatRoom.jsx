import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActivityMessages, sendChatMessage } from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const ChatRoom = () => {
    const { activityId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadMessages();

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
        socketRef.current = io(socketUrl);

        socketRef.current.emit('register', user.id);
        socketRef.current.emit('join_activity_room', { activityId });

        socketRef.current.on('new_activity_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socketRef.current.emit('leave_activity_room', { activityId });
            socketRef.current.disconnect();
        };
    }, [activityId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            const res = await getActivityMessages(activityId);
            setMessages(res.data.messages);
        } catch (err) {
            toast.error('Failed to load messages or unauthorized');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await sendChatMessage({ activityId, content: newMessage });
            socketRef.current.emit('send_activity_message', res.data.message);
            setNewMessage('');
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    if (loading) return <div className="loading">Initializing chat...</div>;

    return (
        <div className="chat-room fade-in">
            <header className="chat-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <h2>Event Chat</h2>
            </header>

            <div className="messages-container">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.userId === user.id ? 'own-message' : ''}`}>
                        {msg.userId !== user.id && (
                            <img src={msg.sender.profilePicture} alt={msg.sender.name} className="sender-avatar" />
                        )}
                        <div className="message-content">
                            {msg.userId !== user.id && <span className="sender-name">{msg.sender.name}</span>}
                            <p>{msg.content}</p>
                            <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()}>Send</button>
            </form>
        </div>
    );
};

export default ChatRoom;
