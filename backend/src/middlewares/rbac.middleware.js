const { errorResponse } = require('../utils/responseHelper');

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { allowRoles };