const postsService = require('../services/postsService');
const imageKitService = require('../services/imageKitService');
const Post = require('../models/postsModel');
const APIError = require('../utils/APIError');

// POST /posts
const createPost = async (req, res, next) => {
  try {
    const post = await postsService.createPost(req.body, req.user.userId);

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// GET /posts
const getAllPosts = async (req, res, next) => {
  try {
    const { posts, pagination } = await postsService.getAllPosts(req.query, req.user.userId);

    res.status(200).json({
      status: 'success',
      data: posts,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

// GET /posts/:id
const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await postsService.getPostById(id, req.user.userId);
    if (!post) throw new APIError('Post not found', 404);

    res
      .status(200)
      .json({ status: 'success', message: 'Post fetched successfully', data: post });
  } catch (err) {
    next(err);
  }
};

// PATCH /posts/:id
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedPost = await postsService.updatePost(id, req.body, req.user.userId);
    if (!updatedPost) throw new APIError('Post not found', 404);

    res.status(200).json({
      status: 'success',
      message: 'Post updated successfully',
      data: updatedPost,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /posts/:id
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await postsService.deletePost(id, req.user.userId);
    if (!deleted) throw new APIError('Post not found', 404);

    res
      .status(204)
      .json({ status: 'success', message: 'Post deleted successfully', data: null });
  } catch (err) {
    next(err);
  }
};

// POST /posts/:id/images
const uploadPostImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      throw new APIError('No files uploaded', 400);
    }

    const post = await Post.findById(id);
    if (!post) {
      throw new APIError('Post not found', 404);
    }

    if (post.userId.toString() !== req.user.userId.toString()) {
      throw new APIError('You are not authorized to upload images to this post', 403);
    }

    const uploadPromises = req.files.map((file) =>
      imageKitService.uploadImage(file, '/post-images', `post-${id}-${Date.now()}`)
    );

    const uploadResults = await Promise.all(uploadPromises);

    const newImages = uploadResults.map((result) => ({
      url: result.url,
      fileId: result.fileId,
    }));

    post.images.push(...newImages);
    await post.save();

    res.status(200).json({
      status: 'success',
      message: 'Images uploaded successfully',
      data: {
        images: post.images,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /posts/:id/images/:imageId
const deletePostImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      throw new APIError('Post not found', 404);
    }

    if (post.userId.toString() !== req.user.userId.toString()) {
      throw new APIError('You are not authorized to delete images from this post', 403);
    }

    const imageIndex = post.images.findIndex((img) => img.fileId === imageId);
    if (imageIndex === -1) {
      throw new APIError('Image not found', 404);
    }

    await imageKitService.deleteImage(imageId);

    post.images.splice(imageIndex, 1);
    await post.save();

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// POST /posts/:id/view
const incrementView = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ip = req.ip || req.connection.remoteAddress;
    const postCheck = await Post.findById(id);

    if (postCheck && postCheck.viewedByIps && postCheck.viewedByIps.includes(ip)) {
      return res.status(200).json({ status: 'success', message: 'Already viewed', data: { views: postCheck.views } });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      {
        $inc: { views: 1 },
        $addToSet: { viewedByIps: ip }
      },
      { new: true }
    );

    if (!post) {
      throw new APIError('Post not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'View counted',
      data: { views: post.views },
    });
  } catch (err) {
    next(err);
  }
};

// GET /posts/search
const searchPosts = async (req, res, next) => {
  try {
    const result = await postsService.searchPosts(req.query);
    res.status(200).json({
      status: 'success',
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// GET /posts/user/drafts
const getDrafts = async (req, res, next) => {
  try {
    const result = await postsService.getDrafts(req.user.userId, req.query);
    res.status(200).json({
      status: 'success',
      data: result.drafts,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// POST /posts/:id/publish
const publishPost = async (req, res, next) => {
  try {
    const post = await postsService.publishPost(req.params.id, req.user.userId);
    res.status(200).json({
      status: 'success',
      message: 'Post published successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// POST /posts/:id/schedule
const schedulePost = async (req, res, next) => {
  try {
    const { publishDate } = req.body;
    if (!publishDate) {
      throw new APIError('publishDate is required', 400);
    }
    const post = await postsService.schedulePost(req.params.id, req.user.userId, publishDate);
    res.status(200).json({
      status: 'success',
      message: 'Post scheduled successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  uploadPostImages,
  deletePostImage,
  incrementView,
  searchPosts,
  getDrafts,
  publishPost,
  schedulePost,
};