const express = require('express');
const cors = require('cors');
const { CLIENT_URL } = require('./config/env');
const { errorHandler } = require('./utils/errorHandler');
const { setupSwagger } = require('./swagger/swagger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');
const notificationRoutes = require('./routes/notification.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const rateLimit = require('./middlewares/rateLimiter');
const sanitize = require('./middlewares/sanitize');

const app = express();

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit);
app.use(sanitize);

// Custom Security Headers & Content Security Policy (CSP) Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/docs')) {
    // Relaxed CSP to allow Swagger UI resources to render
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:;"
    );
  } else {
    // Strict CSP for standard API JSON endpoints
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; sandbox;");
  }

  // Essential API security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  next();
});


setupSwagger(app);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

module.exports = app;