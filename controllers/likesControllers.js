const likesService = require('../services/likesService');

// POST /likes - Toggle like
const toggleLike = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.body;
    const result = await likesService.toggleLike(req.user.userId, targetType, targetId);

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: { liked: result.liked },
    });
  } catch (err) {
    next(err);
  }
};

// GET /likes/count - Get likes count
const getLikesCount = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    const result = await likesService.getLikesCount(targetType, targetId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// GET /likes/check - Check if user liked
const checkLike = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    const result = await likesService.isLikedByUser(req.user.userId, targetType, targetId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/:userId/likes - Get user's likes
const getUserLikes = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { likes, pagination } = await likesService.getUserLikes(userId, req.query);

    res.status(200).json({
      status: 'success',
      data: likes,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  toggleLike,
  getLikesCount,
  checkLike,
  getUserLikes,
};
