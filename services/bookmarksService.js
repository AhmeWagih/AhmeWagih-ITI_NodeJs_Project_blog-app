const mongoose = require('mongoose');
const Bookmark = require('../models/bookmarksModel');
const Post = require('../models/postsModel');
const APIError = require('../utils/APIError');


const addBookmark = async (userId, postId) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new APIError('Invalid post ID', 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new APIError('Post not found', 404);
  }

  const existingBookmark = await Bookmark.findOne({ userId, postId });
  if (existingBookmark) {
    throw new APIError('Post already bookmarked', 400);
  }

  await Bookmark.create({ userId, postId });
  return { message: 'Post bookmarked successfully' };
};

const removeBookmark = async (userId, postId) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new APIError('Invalid post ID', 400);
  }

  const bookmark = await Bookmark.findOneAndDelete({ userId, postId });
  if (!bookmark) {
    throw new APIError('Bookmark not found', 404);
  }

  return { message: 'Bookmark removed successfully' };
};

const getUserBookmarks = async (userId, query = {}) => {
  let { page = 1, limit = 20 } = query;
  page = Number(page);
  limit = Number(limit);

  const bookmarks = await Bookmark.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: 'postId',
      select: 'title content createdAt userId',
      populate: { path: 'userId', select: 'name email' },
    });

  const total = await Bookmark.countDocuments({ userId });

  return {
    bookmarks: bookmarks.map((b) => b.postId),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
};
