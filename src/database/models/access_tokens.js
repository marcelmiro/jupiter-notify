'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        userId: Joi.string().alphanum().required(),
        accessToken: Joi.string().required(),
        iv: Joi.string().required(),
        created: [Joi.string().alphanum(), Joi.number()]
    }).required(),
    userId: Joi.string().alphanum().required(),
    accessToken: Joi.string().required(),
    iv: Joi.string().required(),
    created: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required()
}
