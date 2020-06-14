'use strict'
const Joi = require('@hapi/joi')
module.exports = {
    schema: Joi.object().keys({
        name: Joi.string(),
        value: Joi.string()
    }).options({ presence: 'required' }),
    name: Joi.string().required(),
    value: Joi.string().required()
}
