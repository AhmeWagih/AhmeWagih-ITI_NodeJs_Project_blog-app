const Joi = require('joi');

const createCommentBody = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required(),
  postId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'postId must be a valid MongoDB ObjectId',
    }),
  parentCommentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .optional()
    .messages({
      'string.pattern.base': 'parentCommentId must be a valid MongoDB ObjectId',
    }),
});

const createCommentSchema = {
  body: createCommentBody,
};

module.exports = createCommentSchema;
