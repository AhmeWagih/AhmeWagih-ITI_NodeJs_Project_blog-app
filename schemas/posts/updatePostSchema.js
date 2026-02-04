const Joi = require('joi');

const updatePostBody = Joi.object({
  title: Joi.string().trim(),
  content: Joi.string().trim(),
  author: Joi.any().forbidden(),
  userId: Joi.any().forbidden(),
  tags: Joi.array().items(Joi.string().trim()),
  published: Joi.boolean(),
  likes: Joi.number().integer().min(0),
}).min(1);

const updatePostSchema = {
  body: updatePostBody,
}

module.exports = updatePostSchema;