const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (toEmail, firstName, tempPassword) => {
  await transporter.sendMail({
    from: EMAIL_USER,
    to: toEmail,
    subject: 'Welcome to Task Management System',
    html: `
      <h2>Welcome, ${firstName}!</h2>
      <p>Your account has been created.</p>
      <p><strong>Email:</strong> ${toEmail}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please log in and reset your password immediately.</p>
    `,
  });
};

const sendResetEmail = async (toEmail, resetLink) => {
  await transporter.sendMail({
    from: EMAIL_USER,
    to: toEmail,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetLink}">Reset Password</a>
    `,
  });
};

module.exports = { sendWelcomeEmail, sendResetEmail };