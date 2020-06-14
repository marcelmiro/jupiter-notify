'use strict'
const Joi = require('@hapi/joi')
const stripe = require('../../config/stripe')
const { findCustomer, createCustomer, deleteCustomer } = require('./customers')
const { updateUser } = require('../../database/repositories/users')

const createSubscriptionSession = async (customerId, currency) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            currency: Joi.string()
        }).required().validateAsync({ customerId, currency })

        const CUSTOMER = await findCustomer(customerId)
        if (!CUSTOMER) return console.error('createSubscriptionSession(): Stripe customer not found.')

        CUSTOMER.currency = CUSTOMER.currency && process.env['STRIPE_PLAN_ID_' + CUSTOMER.currency.toUpperCase()]
            ? CUSTOMER.currency : undefined
        currency = currency && process.env['STRIPE_PLAN_ID_' + currency.toUpperCase()]
            ? currency : undefined

        let planId
        if (CUSTOMER.currency && currency) {
            if (CUSTOMER.currency !== currency) {
                await deleteCustomer(customerId)
                customerId = await createCustomer({
                    userId: CUSTOMER.description,
                    name: CUSTOMER.name,
                    email: CUSTOMER.email
                })
                await updateUser(CUSTOMER.description, 'stripe_id', customerId)
            }
            planId = process.env['STRIPE_PLAN_ID_' + currency.toUpperCase()]
        } else if (CUSTOMER.currency) planId = process.env['STRIPE_PLAN_ID_' + CUSTOMER.currency.toUpperCase()]
        else if (currency) planId = process.env['STRIPE_PLAN_ID_' + currency.toUpperCase()]
        else planId = process.env.STRIPE_PLAN_ID

        return await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: customerId,
            subscription_data: {
                items: [{ plan: planId }]
            },
            success_url: process.env.URL + '/stripe/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: process.env.URL + '/stripe/fail'
        })
    } catch (e) {
        return console.error('createSubscriptionSession(): ' + e.message)
    }
}

const createEditPaymentSession = async customerId => {
    try {
        await Joi.string().required().validateAsync(customerId)

        const CUSTOMER = await findCustomer(customerId)
        if (!CUSTOMER) return console.error('createEditPaymentSession(): Stripe customer not found.')
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
        if (!SUBSCRIPTION?.id) return console.error('createEditPaymentSession(): Subscription not found.')

        return await stripe.checkout.sessions.create({
            mode: 'setup',
            payment_method_types: ['card'],
            customer: customerId,
            setup_intent_data: {
                metadata: { customer_id: customerId, subscription_id: SUBSCRIPTION.id }
            },
            success_url: process.env.URL + '/dashboard',
            cancel_url: process.env.URL + '/dashboard'
        })
    } catch (e) {
        return console.error('createEditPaymentSession(): ' + e.message)
    }
}

module.exports = { createSubscriptionSession, createEditPaymentSession }
