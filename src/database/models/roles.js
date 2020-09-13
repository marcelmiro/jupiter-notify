'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        roleId: [Joi.string().alphanum(), Joi.number()],
        name: Joi.string(),
        color: Joi.string(),
        discordId: Joi.string().alphanum()
    }).options({ presence: 'required' }),
    roleId: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required(),
    name: Joi.string().required(),
    color: Joi.string().required(),
    discordId: Joi.string().alphanum().required()
}
