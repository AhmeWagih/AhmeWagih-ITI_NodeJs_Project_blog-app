const commentsService = require('../services/commentsService');
const APIError = require('../utils/APIError');

// POST /comments
const createComment = async (req, res, next) => {
  try {
    const comment = await commentsService.createComment(req.body, req.user.userId);

    res.status(201).json({
      status: 'success',
      message: 'Comment created successfully',
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// GET /comments
const getAllComments = async (req, res, next) => {
  try {
    const { comments, pagination } = await commentsService.getAllComments(
      req.query,
      req.user.userId
    );

    res.status(200).json({
      status: 'success',
      data: comments,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

// GET /comments/:id
const getComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await commentsService.getCommentById(id, req.user.userId);

    res.status(200).json({
      status: 'success',
      message: 'Comment fetched successfully',
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /comments/:id
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedComment = await commentsService.updateCommentById(
      id,
      req.body,
      req.user.userId
    );

    if (!updatedComment) {
      throw new APIError('Comment not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Comment updated successfully',
      data: updatedComment,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await commentsService.deleteCommentById(id, req.user.userId);

    if (!deleted) {
      throw new APIError('Comment not found', 404);
    }

    res.status(204).json({
      status: 'success',
      message: 'Comment deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /posts/:postId/comments
const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { comments, pagination } = await commentsService.getCommentsByPost(
      postId,
      req.user.userId,
      req.query
    );

    res.status(200).json({
      status: 'success',
      data: comments,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComment,
  getAllComments,
  getComment,
  updateComment,
  deleteComment,
  getCommentsByPost,
};
