const Joi = require('joi');

const forgotPasswordBody = Joi.object({
  email: Joi.string().email().required(),
});

const forgotPasswordSchema = {
  body: forgotPasswordBody,
};

module.exports = forgotPasswordSchema;
