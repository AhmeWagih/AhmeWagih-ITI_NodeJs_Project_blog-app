const Joi = require('joi');

const changePasswordBody = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords must match',
  }),
});

const changePasswordSchema = {
  body: changePasswordBody,
};

module.exports = changePasswordSchema;
