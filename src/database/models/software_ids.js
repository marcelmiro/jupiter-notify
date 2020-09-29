'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        softwareId: Joi.string().required(),
        name: Joi.string().required()
    }).required(),
    softwareId: Joi.string().required(),
    name: Joi.string().required()
}
