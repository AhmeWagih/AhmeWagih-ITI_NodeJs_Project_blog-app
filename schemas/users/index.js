const getAllUserSchema = require('./getAllUserSchema');
const updateUserSchema = require('./updateUserSchema');
const registerSchema = require('./registerSchema');
const loginSchema = require('./loginSchema');
const forgotPasswordSchema = require('./forgotPasswordSchema');
const resetPasswordSchema = require('./resetPasswordSchema');
const changePasswordSchema = require('./changePasswordSchema');

module.exports = {
  registerSchema,
  getAllUserSchema,
  updateUserSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};