// backend/src/websocket/socket.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const NotificationService = require('../services/notification.service');

// We use a "Map" to keep track of exactly who is currently online
const onlineUsers = new Map();

const initializeWebSocket = (httpServer) => {
    // 1. Turn on the WebSocket server
    const io = socketIo(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // 2. Security checkpoint: Verify their JWT token before letting them connect
    io.use((socket, next) => {
        // Grab the token from the connection request
        const token = socket.handshake.auth.token; 
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            // Verify the token uses our secret password from the .env file
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // Attach their user ID to this connection
            next(); // Let them in
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    // 3. Handle what happens when a user successfully connects
    io.on('connection', async (socket) => {
        const userId = socket.user.id;
        
        // Add them to our "online list"
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online and connected`);

        // 4. Offline Delivery: Check if they missed anything while they were gone
        try {
            const unreadNotifications = await NotificationService.getUserNotifications(userId);
            
            // If they have unread messages, send them through the socket immediately
            if (unreadNotifications && unreadNotifications.length > 0) {
                socket.emit('offline-notifications', unreadNotifications);
            }
        } catch (error) {
            console.error('Error fetching offline notifications:', error);
        }

        // 5. Handle what happens when they close the website
        socket.on('disconnect', () => {
            onlineUsers.delete(userId); // Remove from online list
            console.log(`User ${userId} disconnected`);
        });
    });

    return io;
};

// Helper tool we can use anywhere in the backend to trigger an instant notification
const emitRealTimeEvent = async (io, userId, eventName, message) => {
    try {
        // First, save it to the database so it's permanent (in case they are offline)
        const savedNotification = await NotificationService.createNotification(userId, message);

        // Check our online list. Are they actively on the website right now?
        const socketId = onlineUsers.get(userId);
        
        if (socketId) {
            // Yes! Shoot it straight to their screen instantly using the requested event name
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