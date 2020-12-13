'use strict'
const Joi = require('joi')

module.exports = {
    roleId: Joi.number().required(),
    name: Joi.string().trim().required(),
    insertRole: Joi.object().keys({
        name: Joi.string().trim().required(),
        color: Joi.string(),
        discordId: [Joi.string().alphanum(), Joi.number().unsafe()],
        transferable: Joi.boolean()
    }),
    updateRole: {
        name: Joi.string().trim().required(),
        color: Joi.string(),
        discordId: Joi.alternatives([Joi.string().alphanum(), Joi.number().unsafe()]),
        transferable: Joi.boolean()
    }
}
