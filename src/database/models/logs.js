'use strict'
const Joi = require('joi')

module.exports = {
    created: Joi.number().unsafe().required(),
    insertLog: Joi.object().keys({
        level: Joi.string().trim().required(),
        message: Joi.string().trim().required(),
        created: Joi.number().unsafe()
    })
}
