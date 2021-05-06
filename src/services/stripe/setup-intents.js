'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')

const findSetupIntent = async id => {
    try {
        await Joi.string().required().validateAsync(id)
    } catch (e) { return }

    return await stripe.setupIntents.retrieve(id).catch(() => { return undefined })
}

module.exports = { findSetupIntent }
