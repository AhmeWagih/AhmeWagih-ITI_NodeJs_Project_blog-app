const express = require('express');
const commentController = require('../controllers/commentsControllers');
const schemas = require('../schemas/comments');
const validate = require('../middleware/validation');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router
  .route('/')
  .get(authenticate, validate(schemas.getAllCommentsSchema), commentController.getAllComments)
  .post(authenticate, validate(schemas.createCommentSchema), commentController.createComment);

router
  .route('/:id')
  .get(authenticate, commentController.getComment)
  .patch(authenticate, validate(schemas.updateCommentSchema), commentController.updateComment)
  .delete(authenticate, commentController.deleteComment);

module.exports = router;
