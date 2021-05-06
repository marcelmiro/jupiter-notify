'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        roleId: [Joi.string().alphanum().required(), Joi.number().required()],
        name: Joi.string().required(),
        color: Joi.string(),
        discordId: Joi.string().alphanum(),
        transferable: Joi.boolean()
    }).required(),
    roleId: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required(),
    name: Joi.string().required(),
    color: Joi.string().required(),
    discordId: Joi.string().alphanum().required(),
    transferable: Joi.boolean().required()
}
