const express = require('express');
const postController = require('../controllers/postsControllers');
const commentController = require('../controllers/commentsControllers');
const schemas = require('../schemas/posts');
const validate = require('../middleware/validation');
const authenticate = require('../middleware/authenticate');
const { uploadPostImages } = require('../middleware/upload');
const router = express.Router();

router.get('/search', postController.searchPosts);
router.get('/drafts', authenticate, postController.getDrafts);
router.post('/:id/publish', authenticate, postController.publishPost);
router.post('/:id/schedule', authenticate, postController.schedulePost);

router
  .route('/')
  .get(authenticate, validate(schemas.getAllPostSchema), postController.getAllPosts)
  .post(authenticate, validate(schemas.createPostSchema), postController.createPost);

router
  .route('/:id')
  .get(authenticate, postController.getPost)
  .patch(authenticate, validate(schemas.updatePostSchema), postController.updatePost)
  .delete(authenticate, postController.deletePost);

// Post images
router.post('/:id/images', authenticate, uploadPostImages, postController.uploadPostImages);
router.delete('/:id/images/:imageId', authenticate, postController.deletePostImage);

// Post views
router.post('/:id/view', postController.incrementView);

// Get comments for a specific post
router.get('/:postId/comments', authenticate, commentController.getCommentsByPost);

module.exports = router;