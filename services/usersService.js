const mongoose = require("mongoose");
const User = require("../models/usersModel");
const APIError = require("../utils/APIError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllUsers = async ({ page = 1, limit = 10 }) => {
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 10;

  const skip = (page - 1) * limit;

  const users = await User.find().select("-password").skip(skip).limit(limit);
  const total = await User.countDocuments();

  return {
    users,
    pagination: { page, limit, total },
  };
};

const searchUsers = async ({ q, page = 1, limit = 10 }) => {
  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 10;

  const regex = new RegExp(q, 'i');
  const filter = {
    $or: [
      { name: regex },
      { email: regex }
    ]
  };

  const users = await User.find(filter)
    .select('name email profilePicture f followersCount followingCount')
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);

  return {
    users,
    pagination: { page, limit, total },
  };
};

const getUserById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError("Invalid user ID", 400);
  }

  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new APIError("User not found", 404);
  }

  return user;
};

const registerUser = async (data) => {
  const { email, password } = data;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError("Email already in use", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ ...data, password: hashedPassword });

  const emailService = require('./emailService');
  try {
    await emailService.sendWelcomeEmail(user);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new APIError("Invalid email or password", 401);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new APIError("Invalid email or password", 401);
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return {
    token,
    tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    role: user.role,
  };
};

const updateUser = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError("Invalid user ID", 400);
  }

  const updatedUser = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new APIError("User not found", 404);
  }

  return updatedUser;
};

const deleteUser = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError("Invalid user ID", 400);
  }

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    throw new APIError("User not found", 404);
  }

  return deletedUser;
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
  searchUsers,
};
