'use strict';

var Joi = require('joi');

module.exports = {
  schema: Joi.object().keys({
    softwareId: Joi.string(),
    name: Joi.string()
  }).options({
    presence: 'required'
  }),
  softwareId: Joi.string().required(),
  name: Joi.string().required(),
  oneTimeUse: Joi["boolean"]()
};