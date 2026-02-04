const mongoose = require('mongoose');
const Post = require('../models/postsModel');
const APIError = require('../utils/APIError');

const createPost = async (data, userId) => {
  const post = await Post.create({ ...data, userId });
  return post;
};

const getAllPosts = async ({ page = 1, limit = 10 }, userId) => {
  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 10;

  const postsPromise = Post.find({}, { published: 0 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'name email');

  const totalPromise = Post.countDocuments();

  const [postsDocs, total] = await Promise.all([postsPromise, totalPromise]);

  const posts = postsDocs.map((post) => {
    const postObj = post.toObject();
    postObj.isOwner = post.userId && post.userId._id.toString() === userId.toString();
    postObj.user = postObj.userId;
    delete postObj.userId;
    return postObj;
  });

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPostById = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError('Invalid post ID', 400);
  }

  const post = await Post.findOne({ _id: id }, { published: 0 }).populate(
    'userId',
    'name email'
  );
  if (!post) {
    throw new APIError('Post not found', 404);
  }

  const postObj = post.toObject();
  postObj.isOwner = post.userId && post.userId._id.toString() === userId.toString();
  postObj.user = postObj.userId;
  delete postObj.userId;

  return postObj;
};

const updatePost = async (id, data, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError('Invalid post ID', 400);
  }

  const post = await Post.findById(id);
  if (!post) {
    return null;
  }

  if (post.userId.toString() !== userId.toString()) {
    throw new APIError('You are not authorized to update this post', 403);
  }

  const updatedPost = await Post.findOneAndUpdate({ _id: id }, data, {
    new: true,
    runValidators: true,
  });

  return updatedPost;
};

const deletePost = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError('Invalid post ID', 400);
  }

  const post = await Post.findById(id);
  if (!post) {
    return null;
  }

  if (post.userId.toString() !== userId.toString()) {
    throw new APIError('You are not authorized to delete this post', 403);
  }

  const deletedPost = await Post.findOneAndDelete({ _id: id });

  return deletedPost;
};

const searchPosts = async (query = {}) => {
  let { q, tags, author, startDate, endDate, page = 1, limit = 10 } = query;
  page = Number(page);
  limit = Number(limit);

  const filter = {};

  if (q && q.trim()) {
    filter.$text = { $search: q };
  }

  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
    filter.tags = { $in: tagsArray };
  }

  if (author && mongoose.isValidObjectId(author)) {
    filter.userId = author;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  filter.status = 'published';

  const sortBy = q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
  const projection = q ? { score: { $meta: 'textScore' } } : {};

  const postsPromise = Post.find(filter, projection)
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'name email profilePicture');

  const totalPromise = Post.countDocuments(filter);

  const [posts, total] = await Promise.all([postsPromise, totalPromise]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get user drafts
const getDrafts = async (userId, query = {}) => {
  let { page = 1, limit = 10 } = query;
  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) limit = 10;

  const filter = { userId, status: 'draft' };

  const drafts = await Post.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Post.countDocuments(filter);

  return {
    drafts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Publish a post
const publishPost = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError('Invalid post ID', 400);
  }

  const post = await Post.findOne({ _id: id, userId });
  if (!post) {
    throw new APIError('Post not found or you are not authorized', 404);
  }

  post.status = 'published';
  post.published = true;
  post.publishedAt = new Date();
  await post.save();

  return post;
};

// Schedule a post
const schedulePost = async (id, userId, publishDate) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError('Invalid post ID', 400);
  }

  const date = new Date(publishDate);
  if (isNaN(date.getTime())) {
    throw new APIError('Invalid date format', 400);
  }

  if (date <= new Date()) {
    throw new APIError('Schedule time must be in the future', 400);
  }

  const post = await Post.findOne({ _id: id, userId });
  if (!post) {
    throw new APIError('Post not found or you are not authorized', 404);
  }

  post.status = 'scheduled';
  post.publishedAt = date;
  post.published = false;
  await post.save();

  return post;
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
  getDrafts,
  publishPost,
  schedulePost,
};
