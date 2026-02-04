const mongoose = require('mongoose');
const Comment = require('../models/commentsModel');
const Post = require('../models/postsModel');
const APIError = require('../utils/APIError');

const createComment = async (commentData, userId) => {
  const { postId, parentCommentId } = commentData;

  if (!mongoose.isValidObjectId(postId)) {
    throw new APIError('Invalid post ID', 400);
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new APIError('Post not found', 404);
  }

  if (parentCommentId) {
    if (!mongoose.isValidObjectId(parentCommentId)) {
      throw new APIError('Invalid parent comment ID', 400);
    }
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new APIError('Parent comment not found', 404);
    }
    if (parentComment.postId.toString() !== postId.toString()) {
      throw new APIError('Parent comment does not belong to this post', 400);
    }
    if (parentComment.parentCommentId) {
      throw new APIError('Cannot reply to a nested comment (max depth is 2)', 400);
    }
  }

  const comment = await Comment.create({ ...commentData, userId });

  const Notification = require('../models/notificationsModel');
  const emailService = require('./emailService');
  const User = require('../models/usersModel');

  if (post.userId.toString() !== userId.toString()) {
    await Notification.create({
      userId: post.userId,
      type: 'comment',
      relatedUserId: userId,
      relatedPostId: postId,
      read: false
    });

    try {
      const postAuthor = await User.findById(post.userId);
      const commenter = await User.findById(userId);
      if (postAuthor && commenter) {
        await emailService.sendCommentNotification(postAuthor, commenter, post, comment);
      }
    } catch (error) {
      console.error('Failed to send comment notification email:', error);
    }
  }

  // Notify Parent Comment Author (if reply)
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (parentComment && parentComment.userId.toString() !== userId.toString()) {
      // Create Notification
      await Notification.create({
        userId: parentComment.userId,
        type: 'reply',
        relatedUserId: userId,
        relatedPostId: postId,
        relatedCommentId: comment._id,
        read: false
      });

      // Send Email
      try {
        const parentAuthor = await User.findById(parentComment.userId);
        const replier = await User.findById(userId);
        if (parentAuthor && replier) {
          await emailService.sendReplyNotification(parentAuthor, replier, parentComment, comment);
        }
      } catch (error) {
        console.error('Failed to send reply notification email:', error);
      }
    }
  }

  return comment.populate([
    { path: 'userId', select: 'name email' },
    { path: 'parentCommentId', select: 'content userId' },
  ]);
};

const getAllComments = async (query, userId) => {
  let { page = 1, limit = 10, postId } = query;
  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 10;

  const filter = {};
  if (postId) {
    if (!mongoose.isValidObjectId(postId)) {
      throw new APIError('Invalid post ID', 400);
    }
    filter.postId = postId;
  }

  const commentsPromise = Comment.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'name email')
    .populate('parentCommentId', 'content userId');

  const totalPromise = Comment.countDocuments(filter);

  const [commentsDocs, total] = await Promise.all([commentsPromise, totalPromise]);

  const comments = commentsDocs.map((comment) => {
    const commentObj = comment.toObject();
    commentObj.isOwner = comment.userId && comment.userId._id.toString() === userId.toString();
    commentObj.user = commentObj.userId;
    delete commentObj.userId;
    return commentObj;
  });

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCommentById = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError('Invalid comment ID', 400);
  }

  const comment = await Comment.findById(id)
    .populate('userId', 'name email')
    .populate('parentCommentId', 'content userId');

  if (!comment) {
    throw new APIError('Comment not found', 404);
  }

  const commentObj = comment.toObject();
  commentObj.isOwner = comment.userId && comment.userId._id.toString() === userId.toString();
  commentObj.user = commentObj.userId;
  delete commentObj.userId;

  return commentObj;
};

const updateCommentById = async (id, commentData, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError('Invalid comment ID', 400);
  }

  const comment = await Comment.findById(id);
  if (!comment) {
    return null;
  }

  if (comment.userId.toString() !== userId.toString()) {
    throw new APIError('You are not authorized to update this comment', 403);
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    {
      ...commentData,
      isEdited: true,
      editedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate('userId', 'name email')
    .populate('parentCommentId', 'content userId');

  return updatedComment;
};


const deleteCommentById = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError('Invalid comment ID', 400);
  }

  const comment = await Comment.findById(id).populate('postId');

  if (!comment) {
    return null;
  }

  const isCommentAuthor = comment.userId.toString() === userId.toString();

  let isPostAuthor = false;
  if (comment.postId) {
    if (comment.postId.userId) {
      isPostAuthor = comment.postId.userId.toString() === userId.toString();
    }
  }

  if (!isCommentAuthor && !isPostAuthor) {
    throw new APIError('You are not authorized to delete this comment', 403);
  }

  await Comment.deleteMany({ parentCommentId: id });
  const deletedComment = await Comment.findByIdAndDelete(id);

  return deletedComment;
};

const getCommentsByPost = async (postId, userId, query = {}) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new APIError('Invalid post ID', 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new APIError('Post not found', 404);
  }

  let { page = 1, limit = 20 } = query;
  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 20;


  const topLevelComments = await Comment.find({ postId, parentCommentId: null })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'name email');

  const total = await Comment.countDocuments({ postId, parentCommentId: null });

  const topLevelIds = topLevelComments.map((c) => c._id);
  const replies = await Comment.find({ parentCommentId: { $in: topLevelIds } })
    .sort({ createdAt: 1 })
    .populate('userId', 'name email');

  const comments = topLevelComments.map((comment) => {
    const commentObj = comment.toObject();
    commentObj.isOwner = comment.userId && comment.userId._id.toString() === userId.toString();
    commentObj.user = commentObj.userId;
    delete commentObj.userId;

    commentObj.replies = replies
      .filter((reply) => reply.parentCommentId.toString() === comment._id.toString())
      .map((reply) => {
        const replyObj = reply.toObject();
        replyObj.isOwner = reply.userId && reply.userId._id.toString() === userId.toString();
        replyObj.user = replyObj.userId;
        delete replyObj.userId;
        return replyObj;
      });

    return commentObj;
  });

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createComment,
  getAllComments,
  getCommentById,
  updateCommentById,
  deleteCommentById,
  getCommentsByPost,
};
