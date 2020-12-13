'use strict'
const Joi = require('joi')

module.exports = {
    roleId: Joi.number().required(),
    updatePermission: {
        importance: Joi.number(),
        administrator: Joi.boolean(),
        stats: Joi.string(),
        members: Joi.string(),
        roles: Joi.string(),
        restocks: Joi.string(),
        products: Joi.string(),
        logs: Joi.string(),
        settings: Joi.string()
    }
}
