'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        softwareId: Joi.string(),
        instanceId: Joi.string()
    }).options({ presence: 'required' }),
    accessToken: Joi.string().required(),
    softwareId: Joi.string().required(),
    instanceId: Joi.string().required()
}
