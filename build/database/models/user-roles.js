'use strict';

var Joi = require('joi');

module.exports = {
  schema: Joi.object().keys({
    userId: Joi.string().alphanum(),
    roleId: [Joi.string().alphanum(), Joi.number()]
  }).options({
    presence: 'required'
  }),
  userId: Joi.string().alphanum().required(),
  roleId: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required()
};