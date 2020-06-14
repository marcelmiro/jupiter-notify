'use strict'
const Joi = require('@hapi/joi')
const stripe = require('../../config/stripe')

const listPaymentMethods = async customerId => {
    try {
        await Joi.string().required().validateAsync(customerId)
        return await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card'
        })
    } catch (e) {
        return console.error('listPaymentMethods(): ' + e.message)
    }
}

const findPaymentMethod = async id => {
    try {
        await Joi.string().required().validateAsync(id)
        return await stripe.paymentMethods.retrieve(id).catch(() => { return undefined })
    } catch (e) {
        return console.error('findPaymentMethod(): ' + e.message)
    }
}

const attachPaymentMethod = async (customerId, paymentMethodId) => {
    try {
        await Joi.object().keys({
            customerId: Joi.string().required(),
            paymentMethodId: Joi.string().required()
        }).required().validateAsync({ customerId, paymentMethodId })

        return await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    } catch (e) {
        return console.error('attachPaymentMethod(): ' + e.message)
    }
}

const detachPaymentMethod = async id => {
    try {
        await Joi.string().required().validateAsync(id)
        return await stripe.paymentMethods.detach(id)
    } catch (e) {
        return console.error('detachPaymentMethod(): ' + e.message)
    }
}

module.exports = { listPaymentMethods, findPaymentMethod, attachPaymentMethod, detachPaymentMethod }
