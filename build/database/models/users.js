'use strict';

var Joi = require('joi');

module.exports = {
  schema: Joi.object().keys({
    userId: Joi.string().alphanum(),
    stripeId: Joi.string(),
    username: Joi.string(),
    email: Joi.string().email(),
    avatarUrl: Joi.string()
  }).options({
    presence: 'required'
  }),
  userId: Joi.string().alphanum().required(),
  cookieId: Joi.string().required(),
  stripeId: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  avatarUrl: Joi.string().required(),
  dateCreated: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required()
};