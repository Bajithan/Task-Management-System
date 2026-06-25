const rateLimit = require('express-rate-limit');
const { NODE_ENV } = require('../config/env');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: NODE_ENV === 'development' ? 10000 : 100, // max 10000 requests per 15 minutes in dev, 100 in prod
  standardHeaders: true,     // sends rate limit info in headers
  legacyHeaders: false,      // disables old rate limit headers

  // Message sent when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      errorCode: 429,
      message: 'Too Many Requests',
      description: 'You have exceeded the requests limit. Please try again later.',
    });
  },
});

module.exports = rateLimiter;