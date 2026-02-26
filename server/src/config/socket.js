const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // userId -> socketId

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        socket.on('register', (userId) => {
            userSockets.set(userId, socket.id);
            console.log(`👤 User ${userId} registered with socket ${socket.id}`);
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

const getUserSocket = (userId) => userSockets.get(userId);

module.exports = { initSocket, getIO, getUserSocket };
