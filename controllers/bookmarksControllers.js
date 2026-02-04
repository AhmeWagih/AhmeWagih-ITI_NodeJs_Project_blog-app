const bookmarksService = require('../services/bookmarksService');

// POST /bookmarks/:postId
const addBookmark = async (req, res, next) => {
  try {
    const result = await bookmarksService.addBookmark(req.user.userId, req.params.postId);
    res.status(201).json({ status: 'success', message: result.message });
  } catch (err) {
    next(err);
  }
};

// DELETE /bookmarks/:postId
const removeBookmark = async (req, res, next) => {
  try {
    const result = await bookmarksService.removeBookmark(req.user.userId, req.params.postId);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (err) {
    next(err);
  }
};

// GET /bookmarks
const getUserBookmarks = async (req, res, next) => {
  try {
    const result = await bookmarksService.getUserBookmarks(req.user.userId, req.query);
    res.status(200).json({
      status: 'success',
      data: result.bookmarks,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
};
