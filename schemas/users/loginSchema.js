const Joi = require('joi');

const loginBody = Joi.object({
  email: Joi.string().email().required().messages({ 'string.email': 'Invalid email address' }),
  password: Joi.string().trim().min(8).required(),
}).required();

const loginSchema = {
  body: loginBody
}

module.exports = loginSchema;