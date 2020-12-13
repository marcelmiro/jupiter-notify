'use strict'
const Joi = require('joi')

module.exports = {
    planId: Joi.string().required(),
    roleId: Joi.number().required(),
    currency: Joi.string().alphanum().required(),
    insertPlan: Joi.object().keys({
        planId: Joi.string().trim().required(),
        roleId: Joi.number().required(),
        currency: Joi.string().alphanum().required()
    })
}
