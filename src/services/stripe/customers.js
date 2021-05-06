'use strict'
const Joi = require('joi')
const stripe = require('../../config/stripe')

const listCustomers = async () => {
    return (await stripe.customers.list()).data
}

const findCustomer = async id => {
    await Joi.string().required().validateAsync(id)
    const CUSTOMER = await stripe.customers.retrieve(id, { expand: ['subscriptions'] })
        .catch(() => { return undefined })
    return CUSTOMER && !CUSTOMER.deleted ? CUSTOMER : undefined
}

const createCustomer = async ({ userId: description, name, email }) => {
    try {
        await Joi.object().keys({
            description: Joi.string().alphanum().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required()
        }).required().validateAsync({ description, name, email })
    } catch (e) { return }

    return await stripe.customers.create({ description, name, email })
}

const updateCustomer = async (id, data) => {
    try {
        await Joi.object().keys({
            id: Joi.string().required(),
            data: Joi.object().required()
        }).required().validateAsync({ id, data })
    } catch (e) { return }

    return await stripe.customers.update(id, data)
}

const deleteCustomer = async id => {
    try {
        await Joi.string().required().validateAsync(id)
    } catch (e) { return }

    return await stripe.customers.del(id)
}

module.exports = {
    listCustomers,
    findCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
}
