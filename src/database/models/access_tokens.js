'use strict'
const Joi = require('joi')

module.exports = {
    userId: Joi.string().alphanum().required(),
    accessToken: Joi.string().required()
}
