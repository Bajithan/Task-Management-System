const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const { sendResetEmail } = require('../utils/email');
const { CLIENT_URL } = require('../config/env');

const login = async (email, password) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw { statusCode: 401, message: 'Invalid credentials' };
  if (!user.is_active) throw { statusCode: 403, message: 'Account is deactivated' };

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw { statusCode: 401, message: 'Invalid credentials' };

  const token = generateToken({
    user_id: user.user_id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
  };
};

const forgotPassword = async (email) => {
  const user = await userModel.findByEmail(email);
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await userModel.saveResetToken(email, tokenHash, expires);

  const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
  await sendResetEmail(email, resetLink);
};

const resetPassword = async (email, token, newPassword) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw { statusCode: 400, message: 'Invalid request' };

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (user.reset_token_hash !== tokenHash) {
    throw { statusCode: 400, message: 'Invalid or expired reset token' };
  }

  const expires = new Date(user.reset_token_expires);
  if (expires < new Date()) {
    throw { statusCode: 400, message: 'Reset token has expired' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await userModel.updateUser(user.user_id, { password_hash: passwordHash });
  await userModel.clearResetToken(user.user_id);
};

module.exports = { login, forgotPassword, resetPassword };