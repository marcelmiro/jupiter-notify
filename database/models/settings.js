'use strict'
const Joi = require('@hapi/joi')
module.exports = {
<<<<<<< Updated upstream:database/models/settings.js
    schema: Joi.object().keys({
        name: Joi.string(),
        value: Joi.string()
    }).options({ presence: 'required' }),
=======
>>>>>>> Stashed changes:src/database/models/settings.js
    name: Joi.string().required(),
    updateSetting: Joi.object().keys({
        name: Joi.string().trim().required(),
        value: Joi.string().required()
    })
}
