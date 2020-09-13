'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')

const listPaymentMethods = async customerId => {
    try {
        await Joi.string().required().validateAsync(customerId)
    } catch (e) { return }

    return await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
    }).catch(() => { return undefined })
}

const findPaymentMethod = async id => {
    try {
        await Joi.string().required().validateAsync(id)
    } catch (e) { return }

    return await stripe.paymentMethods.retrieve(id).catch(() => { return undefined })
}

const attachPaymentMethod = async (customerId, paymentMethodId) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            paymentMethodId: Joi.string().required()
        }).required().validateAsync({ customerId, paymentMethodId })
    } catch (e) { return }

    return await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
        .catch(() => { return undefined })
}

const detachPaymentMethod = async id => {
    try {
        await Joi.string().required().validateAsync(id)
    } catch (e) { return }

    return await stripe.paymentMethods.detach(id).catch(() => { return undefined })
}

module.exports = { listPaymentMethods, findPaymentMethod, attachPaymentMethod, detachPaymentMethod }
