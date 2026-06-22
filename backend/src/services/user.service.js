const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../models/user.model');
//const { sendWelcomeEmail } = require('../utils/email');

const createUser = async ({ first_name, last_name, email, role }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) throw { statusCode: 409, message: 'Email already in use' };

  const tempPassword = crypto.randomBytes(8).toString('hex');
  const password_hash = await bcrypt.hash(tempPassword, 12);

  const newUser = await userModel.createUser({
    first_name,
    last_name,
    email,
    password_hash,
    role: role || 'Collaborator',
    is_active: true,
  });

  await sendWelcomeEmail(email, first_name, tempPassword);

  return newUser;
};

const getUsers = async (search, role) => {
  return await userModel.listUsers(search, role);
};

const getUserById = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};

const updateUser = async (userId, updates) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return await userModel.updateUser(userId, updates);
};

const deactivateUser = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return await userModel.updateUser(userId, { is_active: false });
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const userSummary = await userModel.findById(userId);
  if (!userSummary) throw { statusCode: 404, message: 'User not found' };

  const user = await userModel.findByEmail(userSummary.email);
  if (!user) throw { statusCode: 404, message: 'User not found' };

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) throw { statusCode: 400, message: 'Incorrect current password' };

  if (newPassword.length < 8) {
    throw { statusCode: 400, message: 'New password must be at least 8 characters' };
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  return await userModel.updateUser(userId, { password_hash: newHash });
};

module.exports = { createUser, getUsers, getUserById, updateUser, deactivateUser, updatePassword };