const Joi = require('joi');

const updateUserBody = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email().lowercase(),
  age: Joi.number().integer().min(0),
}).min(1);

const updateUserSchema = {
  body: updateUserBody,
}

module.exports = updateUserSchema;