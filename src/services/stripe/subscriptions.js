'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')
const { updateUser } = require('../../database/repositories/users')
const { findPlan } = require('../../database/repositories/plans')
const { findCustomer, createCustomer, deleteCustomer } = require('./customers')

const createSubscription = async ({ customerId, planId, date }) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            planId: Joi.string().required(),
            date: [Joi.string().alphanum(), Joi.number().unsafe()]
        }).required().validateAsync({ customerId, planId, date })
    } catch (e) { return }

    const CUSTOMER = await findCustomer(customerId)
    const PLAN = await findPlan(planId)
    if (!CUSTOMER || !PLAN) return

    if (CUSTOMER.currency?.toLowerCase() !== PLAN.currency.toLowerCase()) {
        await deleteCustomer(customerId)
        customerId = (await createCustomer({
            userId: CUSTOMER.description,
            name: CUSTOMER.name,
            email: CUSTOMER.email
        }))?.id
        if (!customerId) throw new Error(`Couldn't create new Stripe customer for user '${CUSTOMER.description}'.`)
        await updateUser(CUSTOMER.description, 'stripe_id', customerId)
    }

    return await stripe.subscriptions.create({
        customer: customerId,
        items: [{ plan: planId }],
        billing_cycle_anchor: date || 'now',
        proration_behavior: 'none'
    })
}

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

module.exports = { createSubscription, updateSubscription, deleteSubscription }
