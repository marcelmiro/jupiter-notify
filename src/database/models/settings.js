'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        name: Joi.string().required(),
        value: Joi.string().required()
    }).required(),
    name: Joi.string().required(),
    value: Joi.string().required()
}
