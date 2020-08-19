'use strict'
const Joi = require('@hapi/joi')
const stripe = require('../../config/stripe')
const { findCustomer } = require('./customers')

const updateSubscription = async (id, data) => {
    try {
        await Joi.object().keys({
            id: Joi.string().required(),
            data: Joi.object()
        }).required().validateAsync({ id, data })

        return await stripe.subscriptions.update(id, data)
    } catch (e) {
        return console.error('updateSubscription(): ' + e.message)
    }
}

const deleteSubscription = async id => {
    try {
        await Joi.string().required().validateAsync(id)
        return await stripe.subscriptions.del(id)
    } catch (e) {
        return console.error('deleteSubscription(): ' + e.message)
    }
}

const transferSubscription = async ({ customerId, date, currency }) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            date: [Joi.string().alphanum().required(), Joi.number().required()],
            currency: Joi.string()
        }).required().validateAsync({ customerId, date, currency })

        const CUSTOMER = await findCustomer(customerId)
        if (!CUSTOMER) return console.error('transferSubscription(): Stripe customer not found.')

        let planId = process.env.STRIPE_PLAN
        if (CUSTOMER.currency && process.env['STRIPE_PLAN_' + CUSTOMER.currency.toUpperCase()]) {
            planId = process.env['STRIPE_PLAN_' + CUSTOMER.currency.toUpperCase()]
        } else if (currency && process.env['STRIPE_PLAN_' + currency.toUpperCase()]) {
            planId = process.env['STRIPE_PLAN_' + currency.toUpperCase()]
        }

        return await stripe.subscriptions.create({
            customer: customerId,
            items: [{ plan: planId }],
            billing_cycle_anchor: date,
            proration_behavior: 'none'
        })
    } catch (e) {
        return console.error('transferSubscription(): ' + e.message)
    }
}

module.exports = { updateSubscription, deleteSubscription, transferSubscription }
