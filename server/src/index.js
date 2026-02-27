require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');

// Import models to register associations
require('./models');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const connectionRoutes = require('./routes/connections');
const engagementRoutes = require('./routes/engagements');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chats');

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/engagements', engagementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;

const start = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`🚀 Reconnect server running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api`);
    });
};

start();
