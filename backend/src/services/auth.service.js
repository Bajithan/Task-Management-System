const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const { sendResetEmail } = require('../utils/email');
const { CLIENT_URL } = require('../config/env');

const login = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await userModel.findByEmail(normalizedEmail);
  if (!user) throw { statusCode: 401, message: 'Invalid credentials' };
  if (!user.is_active) throw { statusCode: 403, message: 'Account is deactivated' };

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw { statusCode: 401, message: 'Invalid credentials' };

  const token = generateToken({
    user_id: user.user_id,
    email: user.email,
    role: user.role,
    must_reset_password: user.must_reset_password,
  });

  return {
    token,
    mustResetPassword: user.must_reset_password,
    user: {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      must_reset_password: user.must_reset_password,
    },
  };
};

const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await userModel.findByEmail(normalizedEmail);
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await userModel.saveResetToken(normalizedEmail, tokenHash, expires);

  const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${normalizedEmail}`;
  await sendResetEmail(normalizedEmail, resetLink);
};

const resetPassword = async (email, token, newPassword) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await userModel.findByEmail(normalizedEmail);
  if (!user) throw { statusCode: 400, message: 'Invalid request' };

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (user.reset_token_hash !== tokenHash) {
    throw { statusCode: 400, message: 'Invalid or expired reset token' };
  }

  const expires = new Date(user.reset_token_expires);
  if (expires < new Date()) {
    throw { statusCode: 400, message: 'Reset token has expired' };
  }

  if (newPassword.length < 8) {
    throw { statusCode: 400, message: 'Password must be at least 8 characters' };
  }

  const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordComplexityRegex.test(newPassword)) {
    throw {
      statusCode: 400,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await userModel.updateUser(user.user_id, { password_hash: passwordHash, must_reset_password: false });
  await userModel.clearResetToken(user.user_id);
};

const forceResetPassword = async (userId, currentPassword, newPassword) => {
  const user = await userModel.findById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };

  const fullUser = await userModel.findByEmail(user.email);
  if (!fullUser) throw { statusCode: 404, message: 'User not found' };

  const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);
  if (!isMatch) throw { statusCode: 400, message: 'Incorrect current password' };

  if (newPassword.length < 8) {
    throw { statusCode: 400, message: 'Password must be at least 8 characters' };
  }

  const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordComplexityRegex.test(newPassword)) {
    throw {
      statusCode: 400,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updatedUser = await userModel.updateUser(userId, {
    password_hash: passwordHash,
    must_reset_password: false,
  });

  const token = generateToken({
    user_id: updatedUser.user_id,
    email: updatedUser.email,
    role: updatedUser.role,
    must_reset_password: false,
  });

  return {
    token,
    user: {
      user_id: updatedUser.user_id,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      role: updatedUser.role,
      must_reset_password: false,
    },
  };
};

module.exports = { login, forgotPassword, resetPassword, forceResetPassword };