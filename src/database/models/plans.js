'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        planId: Joi.string().required(),
        roleId: [Joi.string().alphanum().required(), Joi.number().required()],
        currency: Joi.string().required()
    }).required(),
    planId: Joi.string().required(),
    roleId: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required(),
    currency: Joi.string().required()
}
