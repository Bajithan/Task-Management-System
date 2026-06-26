const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../models/user.model');
const { sendWelcomeEmail } = require('../utils/email');

const createUser = async ({ first_name, last_name, email, role }) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw { statusCode: 400, message: 'Invalid email format' };
  }
  const emailLower = email.toLowerCase().trim();
  const existing = await userModel.findByEmail(emailLower);
  if (existing) throw { statusCode: 409, message: 'Email already in use' };

  const tempPassword = crypto.randomBytes(8).toString('hex');
  const password_hash = await bcrypt.hash(tempPassword, 12);

  try {
    const newUser = await userModel.createUser({
      first_name,
      last_name,
      email: emailLower,
      password_hash,
      role: role || 'Collaborator',
      is_active: true,
      must_reset_password: true,
    });

    await sendWelcomeEmail(emailLower, first_name, tempPassword);

    return { user: newUser, tempPassword };
  } catch (err) {
    if (err.code === '23505') {
      throw { statusCode: 409, message: 'Email already in use' };
    }
    throw err;
  }
};

const getUsers = async (search, role) => {
  return await userModel.listUsers(search, role);
};

const getUserById = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};

const updateUser = async (userId, updates, requesterUserId) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };

  if (updates.role) {
    const allowedRoles = ['Admin', 'Project Manager', 'Collaborator'];
    if (!allowedRoles.includes(updates.role)) {
      throw { statusCode: 400, message: 'Invalid role value' };
    }

    // Safety guard: An admin cannot change another admin's role
    if (user.role === 'Admin' && parseInt(userId, 10) !== parseInt(requesterUserId, 10)) {
      throw { statusCode: 403, message: 'You cannot change the role of another administrator' };
    }
  }

  if (updates.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.email)) {
      throw { statusCode: 400, message: 'Invalid email format' };
    }
    const emailLower = updates.email.toLowerCase().trim();
    if (emailLower !== user.email.toLowerCase().trim()) {
      const existing = await userModel.findByEmail(emailLower);
      if (existing && existing.user_id !== userId) {
        throw { statusCode: 409, message: 'Email already in use' };
      }
    }
    updates.email = emailLower;
  }

  try {
    return await userModel.updateUser(userId, updates);
  } catch (err) {
    if (err.code === '23505') {
      throw { statusCode: 409, message: 'Email already in use' };
    }
    throw err;
  }
};

const deactivateUser = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return await userModel.updateUser(userId, { is_active: false });
};

const activateUser = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return await userModel.updateUser(userId, { is_active: true });
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

  const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordComplexityRegex.test(newPassword)) {
    throw {
      statusCode: 400,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    };
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  return await userModel.updateUser(userId, { password_hash: newHash, must_reset_password: false });
};

const adminResetPassword = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };

  const tempPassword = crypto.randomBytes(8).toString('hex');
  const password_hash = await bcrypt.hash(tempPassword, 12);

  const updatedUser = await userModel.updateUser(userId, {
    password_hash,
    must_reset_password: true,
  });

  await sendWelcomeEmail(updatedUser.email, updatedUser.first_name, tempPassword);

  return {
    user: updatedUser,
    tempPassword,
  };
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  updatePassword,
  adminResetPassword,
};