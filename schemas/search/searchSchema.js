const Joi = require('joi');

const searchUsersSchema = Joi.object({
  q: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Search query cannot be empty',
    'any.required': 'Search query (q) is required',
  }),
  limit: Joi.number().integer().min(1).max(50).default(10),
  page: Joi.number().integer().min(1).default(1),
});

module.exports = {
  searchUsersSchema,
};
