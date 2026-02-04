const followsService = require('../services/followsService');

// POST /users/:userId/follow
const followUser = async (req, res, next) => {
  try {
    const result = await followsService.followUser(req.user.userId, req.params.userId);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:userId/follow
const unfollowUser = async (req, res, next) => {
  try {
    const result = await followsService.unfollowUser(req.user.userId, req.params.userId);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (err) {
    next(err);
  }
};

// GET /users/:userId/followers
const getFollowers = async (req, res, next) => {
  try {
    const result = await followsService.getFollowers(req.params.userId, req.query);
    res.status(200).json({
      status: 'success',
      data: result.followers,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/:userId/following
const getFollowing = async (req, res, next) => {
  try {
    const result = await followsService.getFollowing(req.params.userId, req.query);
    res.status(200).json({
      status: 'success',
      data: result.following,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
