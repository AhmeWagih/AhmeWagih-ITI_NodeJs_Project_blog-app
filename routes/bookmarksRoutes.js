const express = require('express');
const bookmarksController = require('../controllers/bookmarksControllers');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

// Add bookmark
router.post('/:postId', authenticate, bookmarksController.addBookmark);

// Remove bookmark
router.delete('/:postId', authenticate, bookmarksController.removeBookmark);

module.exports = router;
