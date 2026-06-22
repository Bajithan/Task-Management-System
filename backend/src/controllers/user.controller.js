const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

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
    const user = await userService.createUser({ first_name, last_name, email, role });
    return successResponse(res, user, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, user, 'User updated');
  } catch (err) {
    next(err);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    await userService.deactivateUser(req.params.id);
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

module.exports = { getUsers, getUserById, createUser, updateUser, deactivateUser, getAssignableUsers, updateMe };