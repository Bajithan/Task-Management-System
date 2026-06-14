const sanitizeBody = (req, res, next) => {
  try {
    // Check if there is a body in the request
    if (req.body && typeof req.body === 'object') {

      // Go through every field in the request body
      for (const key in req.body) {

        // Only process text fields (not numbers, booleans etc)
        if (typeof req.body[key] === 'string') {

          // Remove any HTML tags like <script>, <img>, <a> etc
          req.body[key] = req.body[key]
            .replace(/<[^>]*>/g, '')     // removes HTML tags
            .replace(/javascript:/gi, '') // removes javascript: links
            .replace(/on\w+=/gi, '');    // removes onclick= onload= etc
        }
      }
    }

    // Move to the next middleware
    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: 'Input sanitization failed',
      description: error.message,
    });
  }
};

module.exports = sanitizeBody;