'use strict'
const Joi = require('@hapi/joi')
const stripe = require('../../config/stripe')

const createWebhook = async (body, signature) => {
    try {
        await Joi.object().keys({
            body: Joi.required(),
            signature: Joi.required()
        }).required().validateAsync({ body, signature })
        return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_ID)
    } catch (e) {
        return console.error('createWebhook(): ' + e.message)
    }
}

module.exports = { createWebhook }
