'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        accessToken: Joi.string().required(),
        softwareId: Joi.string().required(),
        instanceId: Joi.string().required()
    }).required(),
    accessToken: Joi.string().required(),
    softwareId: Joi.string().required(),
    instanceId: Joi.string().required()
}
