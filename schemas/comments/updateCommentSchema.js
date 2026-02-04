const Joi = require('joi');

const updateCommentBody = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required(),
});

const updateCommentParams = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'id must be a valid MongoDB ObjectId',
    }),
});

const updateCommentSchema = {
  body: updateCommentBody,
  params: updateCommentParams,
};

module.exports = updateCommentSchema;
