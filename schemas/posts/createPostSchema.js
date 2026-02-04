const Joi = require('joi');

const createPostBody = Joi.object({
  title: Joi.string().trim().required(),
  content: Joi.string().trim().required(),
  userId: Joi.any().forbidden(),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  published: Joi.boolean().default(false),
  likes: Joi.number().integer().min(0).default(0),
});


const createPostSchema = {
  body: createPostBody,
}

module.exports = createPostSchema;