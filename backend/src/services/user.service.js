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

module.exports = { createUser, getUsers, getUserById, updateUser, deactivateUser };