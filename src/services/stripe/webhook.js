'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')

const createWebhook = async (body, signature) => {
    try {
        await Joi.object().keys({
            body: Joi.required(),
            signature: Joi.required()
        }).required().validateAsync({ body, signature })

        return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK)
    } catch (e) {}
}

module.exports = { createWebhook }
