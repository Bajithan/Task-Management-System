const express = require('express');
const cors = require('cors');
const { CLIENT_URL } = require('./config/env');
const { errorHandler } = require('./utils/errorHandler');
const { setupSwagger } = require('./swagger/swagger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
// MEMBER 2 — uncomment when your branch is merged:
// const projectRoutes = require('./routes/project.routes');
// MEMBER 3 — uncomment when your branch is merged:
// const taskRoutes = require('./routes/task.routes');
// MEMBER 4 — uncomment when your branch is merged:
const commentRoutes = require('./routes/comment.routes');
const notificationRoutes = require('./routes/notification.routes');
// MEMBER 5 — uncomment when your branch is merged:
// const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// MEMBER 2 — uncomment when your branch is merged:
// app.use('/api/projects', projectRoutes);
// MEMBER 3 — uncomment when your branch is merged:
// app.use('/api/tasks', taskRoutes);
// MEMBER 4 — uncomment when your branch is merged:
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
// MEMBER 5 — uncomment when your branch is merged:
// app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

module.exports = app;