'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')
const { findCustomer } = require('./customers')

const findInvoice = async id => {
    try {
        await Joi.string().required().validateAsync(id)
    } catch (e) { return }

    return await stripe.invoices.retrieve(id).catch(() => { return undefined })
}

const findNextInvoice = async customerId => {
    try {
        await Joi.string().required().validateAsync(customerId)
    } catch (e) { return }

    const CUSTOMER = await findCustomer(customerId)
    const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
    if (!SUBSCRIPTION) return

    return await stripe.invoices.retrieveUpcoming({
        customer: customerId,
        subscription: SUBSCRIPTION.id
    }).catch(() => { return undefined })
}

module.exports = { findInvoice, findNextInvoice }
