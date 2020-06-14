'use strict'
const Joi = require('@hapi/joi')
const stripe = require('../../config/stripe')
const { findCustomer } = require('./customers')

const findInvoice = async id => {
    try {
        await Joi.string().required().validateAsync(id)
        return await stripe.invoices.retrieve(id).catch(() => { return undefined })
    } catch (e) {
        return console.error('getInvoice(): ' + e.message)
    }
}

const findNextInvoice = async customerId => {
    try {
        await Joi.string().required().validateAsync(customerId)

        const CUSTOMER = await findCustomer(customerId)
        if (!CUSTOMER) return console.error('findNextInvoice(): Stripe customer not found.')
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
        if (!SUBSCRIPTION) return console.error('findNextInvoice(): Subscription not found.')

        return await stripe.invoices.retrieveUpcoming({
            customer: customerId,
            subscription: SUBSCRIPTION.id
        }).catch(() => { return undefined })
    } catch (e) {
        return console.error('findNextInvoice(): ' + e.message)
    }
}

module.exports = { findInvoice, findNextInvoice }
