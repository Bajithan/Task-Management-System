const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/responseHelper');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;

    // Enforce mandatory password change if must_reset_password is true
    // Allow access ONLY to the force-reset-password API
    const pathName = req.originalUrl.split('?')[0];
    if (decoded.must_reset_password && pathName !== '/api/auth/force-reset-password') {
      return errorResponse(res, 'Password reset required before accessing this resource', 403, 'PASSWORD_RESET_REQUIRED');
    }

    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

const allowRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied: insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { authenticate, allowRoles };