const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const NotificationService = require('../services/notification.service');

const onlineUsers = new Map();

const initializeWebSocket = (httpServer) => {
    const io = socketIo(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.user.user_id;

        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online and connected`);

        try {
            const unreadNotifications = await NotificationService.getUserNotifications(userId);

            if (unreadNotifications && unreadNotifications.length > 0) {
                socket.emit('offline-notifications', unreadNotifications);
            }
        } catch (error) {
            console.error('Error fetching offline notifications:', error);
        }

        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            console.log(`User ${userId} disconnected`);
        });
    });

    return io;
};

const emitRealTimeEvent = async (io, userId, eventName, message) => {
    try {
        const savedNotification = await NotificationService.createNotification(userId, message);

        const socketId = onlineUsers.get(userId);

        if (socketId) {
            io.to(socketId).emit(eventName, savedNotification);
        }
    } catch (error) {
        console.error(`Failed to send ${eventName} notification:`, error);
    }
};

module.exports = {
    initializeWebSocket,
    emitRealTimeEvent
};