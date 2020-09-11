'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')
const { findCustomer } = require('./customers')

const updateSubscription = async (id, data) => {
    try {
        await Joi.object().keys({
            id: Joi.string().required(),
            data: Joi.object()
        }).required().validateAsync({ id, data })
    } catch (e) { return }

    return await stripe.subscriptions.update(id, data)
}

const deleteSubscription = async id => {
    try {
        await Joi.string().required().validateAsync(id)
    } catch (e) { return }

    return await stripe.subscriptions.del(id)
}

const transferSubscription = async ({ customerId, date, currency }) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            date: [Joi.string().alphanum().required(), Joi.number().required()],
            currency: Joi.string()
        }).required().validateAsync({ customerId, date, currency })
    } catch (e) { return }

    const CUSTOMER = await findCustomer(customerId)
    if (!CUSTOMER) return

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
}

module.exports = { updateSubscription, deleteSubscription, transferSubscription }
