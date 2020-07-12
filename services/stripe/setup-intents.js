'use strict'
const Joi = require('@hapi/joi')
const stripe = require('../../config/stripe')

const findSetupIntent = async id => {
    try {
        await Joi.string().required().validateAsync(id)
        return await stripe.setupIntents.retrieve(id).catch(() => { return undefined })
    } catch (e) {
        return console.error('findSetupIntent(): ' + e.message)
    }
}

module.exports = { findSetupIntent }
