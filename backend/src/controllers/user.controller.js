const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { emitRealTimeEvent } = require('../websocket/socket');

const getUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const users = await userService.getUsers(search, role);
    return successResponse(res, users, 'Users retrieved');
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, user, 'User retrieved');
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    if (!first_name || !last_name || !email) {
      return errorResponse(res, 'first_name, last_name, and email are required', 400);
    }
    const result = await userService.createUser({ first_name, last_name, email, role });
    return successResponse(res, result, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    
    // Trigger administrative update notification
    try {
      const io = req.app.get('io');
      await emitRealTimeEvent(io, req.params.id, 'administrative-update', `Your account details have been updated by an administrator.`);
    } catch (err) {
      console.error("Failed to trigger administrative update notification:", err);
    }
    
    return successResponse(res, user, 'User updated');
  } catch (err) {
    next(err);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    await userService.deactivateUser(req.params.id);
    
    // Trigger real-time account deactivation event
    try {
      const io = req.app.get('io');
      const { emitSystemEvent } = require('../websocket/socket');
      emitSystemEvent(io, req.params.id, 'account-deactivated', { message: 'Your account has been deactivated by an administrator.' });
    } catch (err) {
      console.error("Failed to trigger administrative deactivation notification:", err);
    }

    return successResponse(res, null, 'User deactivated');
  } catch (err) {
    next(err);
  }
};
const getAssignableUsers = async (req, res, next) => {
  try {
    const userModel = require('../models/user.model');
    const users = await userModel.listAssignableUsers();
    return successResponse(res, users, 'Assignable users retrieved');
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Both currentPassword and newPassword are required', 400);
    }

    await userService.updatePassword(userId, currentPassword, newPassword);
    return successResponse(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

const adminResetPassword = async (req, res, next) => {
  try {
    const result = await userService.adminResetPassword(req.params.id);
    
    // Trigger administrative update notification
    try {
      const io = req.app.get('io');
      await emitRealTimeEvent(io, req.params.id, 'administrative-update', `Your account password has been reset by an administrator.`);
    } catch (err) {
      console.error("Failed to trigger admin reset notification:", err);
    }
    
    return successResponse(res, result, 'Temporary password generated and sent successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getAssignableUsers,
  updateMe,
  adminResetPassword,
};