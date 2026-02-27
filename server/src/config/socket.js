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

        socket.on('join_activity_room', ({ activityId }) => {
            socket.join(`activity_${activityId}`);
            console.log(`🏠 User joined room activity_${activityId}`);
        });

        socket.on('leave_activity_room', ({ activityId }) => {
            socket.leave(`activity_${activityId}`);
            console.log(`🚪 User left room activity_${activityId}`);
        });

        socket.on('send_activity_message', (message) => {
            // Emitting to everyone in the room except sender is handled by frontend or io.to().emit
            io.to(`activity_${message.activityId}`).emit('new_activity_message', message);
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
