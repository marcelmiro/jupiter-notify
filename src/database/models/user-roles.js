'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        userId: Joi.string().alphanum().required(),
        roleId: [Joi.string().alphanum().required(), Joi.number().required()]
    }).required(),
    userId: Joi.string().alphanum().required(),
    roleId: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required(),
    arrayRoleIds: Joi.array().min(1).items(
        Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required()).required()
}
