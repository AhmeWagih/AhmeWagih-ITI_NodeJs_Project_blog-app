const mongoose = require('mongoose');
const Follow = require('../models/followsModel');
const User = require('../models/usersModel');
const Notification = require('../models/notificationsModel');
const APIError = require('../utils/APIError');

const followUser = async (followerId, followingId) => {
  if (!mongoose.isValidObjectId(followingId)) {
    throw new APIError('Invalid user ID', 400);
  }

  if (followerId.toString() === followingId.toString()) {
    throw new APIError('You cannot follow yourself', 400);
  }

  const userToFollow = await User.findById(followingId);
  if (!userToFollow) {
    throw new APIError('User not found', 404);
  }

  const existingFollow = await Follow.findOne({ followerId, followingId });
  if (existingFollow) {
    throw new APIError('You are already following this user', 400);
  }
  await Follow.create({ followerId, followingId });

  await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });
  await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });

  await Notification.create({
    userId: followingId,
    type: 'follow',
    relatedUserId: followerId,
    read: false
  });

  return { message: 'Successfully followed user' };
};

const unfollowUser = async (followerId, followingId) => {
  if (!mongoose.isValidObjectId(followingId)) {
    throw new APIError('Invalid user ID', 400);
  }

  const result = await Follow.findOneAndDelete({ followerId, followingId });
  if (!result) {
    throw new APIError('You are not following this user', 400);
  }

  await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
  await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });

  return { message: 'Successfully unfollowed user' };
};

const getFollowers = async (userId, query = {}) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new APIError('Invalid user ID', 400);
  }

  let { page = 1, limit = 20 } = query;
  page = Number(page);
  limit = Number(limit);

  const follows = await Follow.find({ followingId: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('followerId', 'name email profilePicture');

  const total = await Follow.countDocuments({ followingId: userId });

  return {
    followers: follows.map((f) => f.followerId),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getFollowing = async (userId, query = {}) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new APIError('Invalid user ID', 400);
  }

  let { page = 1, limit = 20 } = query;
  page = Number(page);
  limit = Number(limit);

  const follows = await Follow.find({ followerId: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('followingId', 'name email profilePicture');

  const total = await Follow.countDocuments({ followerId: userId });

  return {
    following: follows.map((f) => f.followingId),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
