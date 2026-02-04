const express = require('express');
const likesController = require('../controllers/likesControllers');
const schemas = require('../schemas/likes');
const validate = require('../middleware/validation');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/', authenticate, validate(schemas.toggleLikeSchema), likesController.toggleLike);

router.get(
  '/count',
  authenticate,
  validate(schemas.getLikesCountSchema),
  likesController.getLikesCount
);

router.get(
  '/check',
  authenticate,
  validate(schemas.getLikesCountSchema),
  likesController.checkLike
);

module.exports = router;
