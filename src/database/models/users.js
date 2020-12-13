'use strict'
const Joi = require('joi')

module.exports = {
    userId: Joi.string().alphanum().required(),
    cookieId: Joi.string().required(),
    stripeId: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    avatarUrl: Joi.string().required(),
    lastLogin: Joi.number().unsafe().required(),
    insertUser: Joi.object().keys({
        userId: Joi.string().alphanum().required(),
        stripeId: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        avatarUrl: Joi.string()
    })
}
