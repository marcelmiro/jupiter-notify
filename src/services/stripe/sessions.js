'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')
const { findCustomer, createCustomer, deleteCustomer } = require('./customers')
const { updateUser } = require('../../database/repositories/users')

const createSubscriptionSession = async (customerId, currency, url) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            currency: Joi.string(),
            url: Joi.string().required()
        }).required().validateAsync({ customerId, currency, url })
    } catch (e) { return }

    const CUSTOMER = await findCustomer(customerId)
    if (!CUSTOMER) return

    CUSTOMER.currency = CUSTOMER.currency && process.env['STRIPE_PLAN_' + CUSTOMER.currency.toUpperCase()]
        ? CUSTOMER.currency : undefined
    currency = currency && process.env['STRIPE_PLAN_' + currency.toUpperCase()]
        ? currency : undefined

    let planId
    if (CUSTOMER.currency && currency) {
        if (CUSTOMER.currency !== currency) {
            await deleteCustomer(customerId)
            customerId = (await createCustomer({
                userId: CUSTOMER.description,
                name: CUSTOMER.name,
                email: CUSTOMER.email
            }))?.id
            if (!customerId) throw new Error('Couldn\'t create new Stripe customer.')
            await updateUser(CUSTOMER.description, 'stripe_id', customerId)
        }
        planId = process.env['STRIPE_PLAN_' + currency.toUpperCase()]
    } else if (CUSTOMER.currency) planId = process.env['STRIPE_PLAN_' + CUSTOMER.currency.toUpperCase()]
    else if (currency) planId = process.env['STRIPE_PLAN_' + currency.toUpperCase()]
    else planId = process.env.STRIPE_PLAN

    return await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId,
        subscription_data: {
            items: [{ plan: planId }]
        },
        success_url: url + '/stripe/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: url
    }).catch(() => { return undefined })
}

const createEditPaymentSession = async (customerId, url) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            url: Joi.string().required()
        }).required().validateAsync({ customerId, url })
    } catch (e) { return }

    const CUSTOMER = await findCustomer(customerId)
    const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
    if (!SUBSCRIPTION) return

    return await stripe.checkout.sessions.create({
        mode: 'setup',
        payment_method_types: ['card'],
        customer: customerId,
        setup_intent_data: {
            metadata: {
                customer_id: customerId,
                subscription_id: SUBSCRIPTION.id
            }
        },
        success_url: url + '/dashboard',
        cancel_url: url + '/dashboard'
    }).catch(() => { return undefined })
}

module.exports = { createSubscriptionSession, createEditPaymentSession }
