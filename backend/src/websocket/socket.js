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

        // Join room specific to this user ID to support multiple connections/tabs
        socket.join(`user-${userId}`);
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online and connected (Socket ID: ${socket.id})`);

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
        
        // Broadcast to all sockets belonging to this user
        if (io) {
            io.to(`user-${userId}`).emit(eventName, savedNotification);
        }
    } catch (error) {
        console.error(`Failed to send ${eventName} notification:`, error);
    }
};

const checkApproachingDeadlines = async (io) => {
    try {
        const supabase = require('../config/db');
        const getLocalDateString = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const getUtcDateString = (date) => {
            return date.toISOString().split('T')[0];
        };

        const now = new Date();
        const todayLocal = getLocalDateString(now);
        const todayUtc = getUtcDateString(now);
        
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowLocal = getLocalDateString(tomorrow);
        const tomorrowUtc = getUtcDateString(tomorrow);
        
        // Fetch tasks that are not completed and assigned to someone
        const { data: tasks, error } = await supabase
            .from('Tasks')
            .select('*')
            .not('due_date', 'is', null)
            .not('assigned_to', 'is', null)
            .neq('status', 'Completed');
            
        if (error) throw error;
        
        for (const task of tasks) {
            const taskDate = task.due_date.split('T')[0];
            const isApproaching = taskDate === todayLocal || taskDate === todayUtc || 
                                  taskDate === tomorrowLocal || taskDate === tomorrowUtc;
            
            if (isApproaching) {
                // Check if a notification already exists to avoid spamming for this specific due date
                const { data: existing, error: existErr } = await supabase
                    .from('Notifications')
                    .select('*')
                    .eq('user_id', task.assigned_to)
                    .ilike('message', `%deadline%${task.title}%${taskDate}%`);
                
                if (existErr) continue;
                if (existing && existing.length > 0) continue;
                
                await emitRealTimeEvent(io, task.assigned_to, 'deadline-approaching', `Deadline approaching for task: "${task.title}" (Due: ${taskDate})`);
                console.log(`[Deadline Checker]: Dispatched deadline notification to user ${task.assigned_to} for task "${task.title}"`);
            }
        }
    } catch (err) {
        console.error("Error in deadline checks:", err);
    }
};

const startDeadlineChecks = (io) => {
    // Run immediately on startup
    console.log("[Deadline Checker]: Running startup task deadline check...");
    checkApproachingDeadlines(io);
    
    // Then run every 1 hour (3600000 ms)
    setInterval(() => {
        console.log("[Deadline Checker]: Running hourly task deadline check...");
        checkApproachingDeadlines(io);
    }, 3600000);
};

const emitSystemEvent = (io, userId, eventName, data) => {
    try {
        if (io) {
            io.to(`user-${userId}`).emit(eventName, data);
        }
    } catch (error) {
        console.error(`Failed to emit system event ${eventName}:`, error);
    }
};

module.exports = {
    initializeWebSocket,
    emitRealTimeEvent,
    emitSystemEvent,
    startDeadlineChecks
};