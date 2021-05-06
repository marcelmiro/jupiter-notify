'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')
const { updateUser } = require('../../database/repositories/users')
const { findPlan } = require('../../database/repositories/plans')
const { findCustomer, createCustomer, deleteCustomer } = require('./customers')

const createSubscriptionSession = async ({ customerId, planId, url, trial }) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            planId: Joi.string().required(),
            url: Joi.string().required(),
            trial: [Joi.number(), Joi.string()]
        }).validateAsync({ customerId, planId, url })
    } catch (e) { return }

    const CUSTOMER = await findCustomer(customerId)
    const PLAN = await findPlan(planId)
    if (!CUSTOMER || !PLAN) return

    if (CUSTOMER.currency && CUSTOMER.currency.toLowerCase() !== PLAN.currency.toLowerCase()) {
        await deleteCustomer(customerId)
        customerId = (await createCustomer({
            userId: CUSTOMER.description,
            name: CUSTOMER.name,
            email: CUSTOMER.email
        }))?.id
        if (!customerId) throw new Error(`Couldn't create new Stripe customer for user '${CUSTOMER.description}'.`)
        await updateUser(CUSTOMER.description, 'stripe_id', customerId)
    }

    return await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId,
        subscription_data: {
            items: [{ plan: planId }],
            trial_period_days: trial
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
