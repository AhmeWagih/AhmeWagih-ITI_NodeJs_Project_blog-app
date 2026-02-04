const Joi = require('joi');

const getLikesCountQuery = Joi.object({
  targetType: Joi.string().valid('Post', 'Comment').required(),
  targetId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'targetId must be a valid MongoDB ObjectId',
    }),
});

const getLikesCountSchema = {
  query: getLikesCountQuery,
};

module.exports = getLikesCountSchema;
