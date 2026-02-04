const Joi = require('joi');

const getAllCommentsQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  postId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'postId must be a valid MongoDB ObjectId',
    }),
});

const getAllCommentsSchema = {
  query: getAllCommentsQuery,
};

module.exports = getAllCommentsSchema;
