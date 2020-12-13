'use strict'
const Joi = require('joi')

module.exports = {
    userId: Joi.string().alphanum().required(),
    roleId: Joi.number().required(),
    arrayRoleIds: Joi.array().min(1).items(
        Joi.number().required()
    ).required(),
    schema: Joi.object().keys({
        userId: Joi.string().alphanum().required(),
        roleId: Joi.number().required()
    })
}
