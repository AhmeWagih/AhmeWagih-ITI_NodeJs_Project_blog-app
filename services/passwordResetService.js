const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/usersModel');
const emailService = require('./emailService');
const APIError = require('../utils/APIError');

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return { message: 'a password reset link has been sent' };
  }

  const resetToken = generateResetToken();
  const hashedToken = hashToken(resetToken);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  try {
    await emailService.sendPasswordResetEmail(user, resetToken);
  } catch (error) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    throw new APIError('Failed to send password reset email', 500);
  }

  return { message: 'a password reset link has been sent' };
};

const verifyResetToken = async (token) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new APIError('Invalid or expired reset token', 400);
  }

  return user;
};

const resetPassword = async (token, newPassword) => {
  const user = await verifyResetToken(token);
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  user.password = hashedPassword;
  user.confirmPassword = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  try {
    await emailService.sendPasswordResetConfirmation(user);
  } catch (error) {
    console.error('Failed to send password reset confirmation email:', error);
  }

  return { message: 'Password reset successful' };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new APIError('User not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new APIError('Current password is incorrect', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  user.password = hashedPassword;
  user.confirmPassword = hashedPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

module.exports = {
  generateResetToken,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  changePassword,
};
