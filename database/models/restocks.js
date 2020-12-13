'use strict'
const Joi = require('joi')

module.exports = {
    password: Joi.string().alphanum().required(),
    roleId: Joi.number().required(),
    stock: Joi.number().required(),
    date: Joi.number().unsafe(),
    insertRestock: Joi.object().keys({
        password: Joi.string().alphanum().required(),
        roleId: Joi.number().required(),
        stock: Joi.number().required(),
        date: Joi.number().unsafe()
    })
}
