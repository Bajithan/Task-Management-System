const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100,                  // max 100 requests per 15 minutes per IP
  standardHeaders: true,     // sends rate limit info in headers
  legacyHeaders: false,      // disables old rate limit headers

  // Message sent when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      errorCode: 429,
      message: 'Too Many Requests',
      description: 'You have exceeded the 100 requests per 15 minutes limit. Please try again later.',
    });
  },
});

module.exports = rateLimiter;