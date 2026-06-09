const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }
    const result = await authService.login(email, password);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 'Email is required', 400);
    await authService.forgotPassword(email);
    return successResponse(res, null, 'If that email exists, a reset link has been sent');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return errorResponse(res, 'Email, token, and new password are required', 400);
    }
    if (newPassword.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters', 400);
    }
    await authService.resetPassword(email, token, newPassword);
    return successResponse(res, null, 'Password reset successful');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, forgotPassword, resetPassword };