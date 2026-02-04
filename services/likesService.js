const mongoose = require('mongoose');
const Like = require('../models/likesModel');
const Post = require('../models/postsModel');
const Comment = require('../models/commentsModel');
const APIError = require('../utils/APIError');

const toggleLike = async (userId, targetType, targetId) => {
  if (!mongoose.isValidObjectId(targetId)) {
    throw new APIError('Invalid target ID', 400);
  }

  let target;
  if (targetType === 'Post') {
    target = await Post.findById(targetId);
    if (!target) {
      throw new APIError('Post not found', 404);
    }
  } else if (targetType === 'Comment') {
    target = await Comment.findById(targetId);
    if (!target) {
      throw new APIError('Comment not found', 404);
    }
  } else {
    throw new APIError('Invalid target type', 400);
  }

  const existingLike = await Like.findOne({ userId, targetType, targetId });
  const Notification = require('../models/notificationsModel');

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    if (targetType === 'Post') {
      await Post.findByIdAndUpdate(targetId, {
        $inc: { likes: -1 },
        $pull: { likedBy: userId }
      });
    } else {
      await Comment.findByIdAndUpdate(targetId, {
        $inc: { likes: -1 },
        $pull: { likedBy: userId }
      });
    }

    return { liked: false, message: 'Like removed successfully' };
  } else {
    await Like.create({ userId, targetType, targetId });

    if (targetType === 'Post') {
      await Post.findByIdAndUpdate(targetId, {
        $inc: { likes: 1 },
        $addToSet: { likedBy: userId }
      });

      if (target.userId.toString() !== userId.toString()) {
        await Notification.create({
          userId: target.userId,
          type: 'like',
          relatedUserId: userId,
          relatedPostId: targetId,
          read: false
        });
      }

    } else {
      await Comment.findByIdAndUpdate(targetId, {
        $inc: { likes: 1 },
        $addToSet: { likedBy: userId }
      });

      if (target.userId.toString() !== userId.toString()) {
        await Notification.create({
          userId: target.userId,
          type: 'like',
          relatedUserId: userId,
          relatedCommentId: targetId,
          relatedPostId: target.postId,
          read: false
        });
      }
    }

    return { liked: true, message: 'Like added successfully' };
  }
};

const getLikesCount = async (targetType, targetId) => {
  if (!mongoose.isValidObjectId(targetId)) {
    throw new APIError('Invalid target ID', 400);
  }

  if (!['Post', 'Comment'].includes(targetType)) {
    throw new APIError('Invalid target type', 400);
  }

  const count = await Like.countDocuments({ targetType, targetId });
  return { count };
};

const isLikedByUser = async (userId, targetType, targetId) => {
  if (!mongoose.isValidObjectId(targetId)) {
    throw new APIError('Invalid target ID', 400);
  }

  if (!['Post', 'Comment'].includes(targetType)) {
    throw new APIError('Invalid target type', 400);
  }

  const like = await Like.findOne({ userId, targetType, targetId });
  return { liked: !!like };
};

const getUserLikes = async (userId, query = {}) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new APIError('Invalid user ID', 400);
  }

  let { page = 1, limit = 10, targetType } = query;
  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 10;

  const filter = { userId };
  if (targetType && ['Post', 'Comment'].includes(targetType)) {
    filter.targetType = targetType;
  }

  const likesPromise = Like.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: 'targetId',
      select: 'title content',
    });

  const totalPromise = Like.countDocuments(filter);

  const [likes, total] = await Promise.all([likesPromise, totalPromise]);

  return {
    likes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  toggleLike,
  getLikesCount,
  isLikedByUser,
  getUserLikes,
};
