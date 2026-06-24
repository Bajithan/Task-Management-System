const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = require('../config/env');

// Create transporter only if credentials exist
let transporter = null;
const isEmailConfigured = EMAIL_HOST && EMAIL_USER && EMAIL_PASS;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT || '587', 10),
    secure: parseInt(EMAIL_PORT || '587', 10) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

/**
 * Sends a welcome email with a temporary password to newly created users
 */
const sendWelcomeEmail = async (email, firstName, tempPassword) => {
  const subject = 'Welcome to Task Management System - Access Credentials';
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5;">Welcome, ${firstName}!</h2>
      <p>An administrator has created your account on the <strong>Task Management System</strong>.</p>
      <p>Please log in using the temporary credentials below:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 16px; margin: 20px 0; text-align: center;">
        <strong>Email:</strong> ${email}<br/>
        <strong>Temporary Password:</strong> ${tempPassword}
      </div>
      <p style="color: #ef4444; font-weight: bold;">Note: You will be required to change your password upon your first login before you can access the system features.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;"/>
      <p style="font-size: 12px; color: #6b7280; text-align: center;">Task Management System Admin Panel</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Task Management System" <${EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`🟢 Onboarding email successfully dispatched to ${email}`);
    } catch (error) {
      console.error(`🔴 Failed to send welcome email to ${email}:`, error.message);
    }
  } else {
    // Development Fallback
    console.log('\n==================================================');
    console.log('📬 DEVELOPMENT EMAIL PREVIEW (SMTP NOT CONFIGURED)');
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log('--------------------------------------------------');
    console.log(`Welcome, ${firstName}!`);
    console.log(`Log in credentials:`);
    console.log(`  Email: ${email}`);
    console.log(`  Temporary Password: ${tempPassword}`);
    console.log('Mandatory password reset will be triggered upon login.');
    console.log('==================================================\n');
  }
};

/**
 * Sends a password reset email
 */
const sendResetEmail = async (email, resetLink) => {
  const subject = 'Task Management System - Password Reset Request';
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5;">Password Reset Request</h2>
      <p>We received a request to reset the password for your account on the <strong>Task Management System</strong>.</p>
      <p>Please click the button below to set a new password. This link is valid for 1 hour.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, copy and paste this link in your browser:</p>
      <p style="font-size: 13px; word-break: break-all;"><a href="${resetLink}">${resetLink}</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;"/>
      <p style="font-size: 12px; color: #6b7280; text-align: center;">Task Management System Security</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Task Management System" <${EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`🟢 Password reset email successfully dispatched to ${email}`);
    } catch (error) {
      console.error(`🔴 Failed to send password reset email to ${email}:`, error.message);
    }
  } else {
    // Development Fallback
    console.log('\n==================================================');
    console.log('📬 DEVELOPMENT EMAIL PREVIEW (SMTP NOT CONFIGURED)');
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log('--------------------------------------------------');
    console.log(`Click this link to reset your password:`);
    console.log(`  ${resetLink}`);
    console.log('==================================================\n');
  }
};

module.exports = {
  sendWelcomeEmail,
  sendResetEmail,
};
