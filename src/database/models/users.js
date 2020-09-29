'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        userId: Joi.string().alphanum().required(),
        cookieId: Joi.string().required(),
        stripeId: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        avatarUrl: Joi.string(),
        created: [Joi.string().alphanum(), Joi.number()]
    }).required(),
    userId: Joi.string().alphanum().required(),
    cookieId: Joi.string().required(),
    stripeId: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    avatarUrl: Joi.string().required(),
    created: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required()
}
