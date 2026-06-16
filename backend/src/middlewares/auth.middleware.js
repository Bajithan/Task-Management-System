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