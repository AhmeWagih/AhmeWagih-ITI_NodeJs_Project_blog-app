const userService = require('../services/usersService');
const imageKitService = require('../services/imageKitService');
const passwordResetService = require('../services/passwordResetService');
const User = require('../models/usersModel');
const APIError = require('../utils/APIError');

// GET /users
const getAllUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await userService.getAllUsers(req.query);

    res.status(200).json({
      status: 'success',
      pagination,
      results: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/search
const searchUsers = async (req, res, next) => {
  try {
    const result = await userService.searchUsers(req.query);
    res.status(200).json({
      status: 'success',
      data: result.users,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/:id
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};

// Post /register
const registerUser = async (req, res, next) => {
  const user = await userService.registerUser(req.body);
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: user,
  });
};

// Post /login
const loginUser = async (req, res, next) => {
  const token = await userService.loginUser(req.body.email, req.body.password);
  res.status(200).json({ status: 'success', data: { token } });
};

// PATCH /users/:id
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedUser = await userService.updateUser(id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    res
      .status(204)
      .json({ status: 'success', message: 'User deleted successfully', data: null });
  } catch (err) {
    next(err);
  }
};

// POST /users/profile-picture
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new APIError('No file uploaded', 400);
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      throw new APIError('User not found', 404);
    }

    if (user.profilePictureId) {
      try {
        await imageKitService.deleteImage(user.profilePictureId);
      } catch (error) {
        console.error('Failed to delete old profile picture:', error);
      }
    }

    const uploadResult = await imageKitService.uploadImage(
      req.file,
      '/profile-pictures',
      `profile-${userId}-${Date.now()}`
    );

    user.profilePicture = uploadResult.url;
    user.profilePictureId = uploadResult.fileId;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: uploadResult.url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/profile-picture
const deleteProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      throw new APIError('User not found', 404);
    }

    if (!user.profilePictureId) {
      throw new APIError('No profile picture to delete', 400);
    }

    await imageKitService.deleteImage(user.profilePictureId);

    user.profilePicture = null;
    user.profilePictureId = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile picture deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// POST /users/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const result = await passwordResetService.forgotPassword(req.body.email);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

// POST /users/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await passwordResetService.resetPassword(token, password);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await passwordResetService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
  uploadProfilePicture,
  deleteProfilePicture,
  forgotPassword,
  resetPassword,
  changePassword,
  searchUsers,
};