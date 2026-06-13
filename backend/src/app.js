const express = require('express');
const cors = require('cors');
const { CLIENT_URL } = require('./config/env');
const { errorHandler } = require('./utils/errorHandler');
const { setupSwagger } = require('./swagger/swagger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
// const projectRoutes = require('./routes/project.routes');
// const taskRoutes = require('./routes/task.routes');
// const commentRoutes = require('./routes/comment.routes');
// const notificationRoutes = require('./routes/notification.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

const rateLimiter = require('./middlewares/rateLimiter');
const sanitizeBody = require('./middlewares/sanitize');

app.use(rateLimiter);
app.use(sanitizeBody);
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

module.exports = app;