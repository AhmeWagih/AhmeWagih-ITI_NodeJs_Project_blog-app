const Joi = require('joi');

const resetPasswordBody = Joi.object({
  token: Joi.string().length(64).required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords must match',
  }),
});

const resetPasswordSchema = {
  body: resetPasswordBody,
};

module.exports = resetPasswordSchema;
