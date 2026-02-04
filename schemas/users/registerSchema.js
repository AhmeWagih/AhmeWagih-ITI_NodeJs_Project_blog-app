const Joi = require('joi');

const registerBody = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required().messages({ 'string.email': 'Invalid email address' }),
  age: Joi.number().integer().min(18),
  password: Joi.string().trim().min(8).required(),
  confirmPassword: Joi.ref('password'),
  role: Joi.string().trim(),
}).required();

const registerSchema = {
  body: registerBody
}

module.exports = registerSchema;