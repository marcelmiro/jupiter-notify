'use strict'
const Joi = require('joi')

module.exports = {
    schema: Joi.object().keys({
        level: Joi.string().required(),
        message: Joi.string().required(),
        created: [Joi.string().alphanum(), Joi.number()]
    }).required(),
    level: Joi.string().required(),
    message: Joi.string().required(),
    created: Joi.alternatives([Joi.string().alphanum(), Joi.number()]).required()
}
