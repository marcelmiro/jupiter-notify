'use strict'
const Joi = require('@hapi/joi')
const stripe = require('../../config/stripe')

const listCustomers = async () => {
    try {
        return (await stripe.customers.list()).data
    } catch (e) {
        return console.error('listCustomers(): ' + e.message)
    }
}

const findCustomer = async id => {
    try {
        await Joi.string().required().validateAsync(id)
        const CUSTOMER = await stripe.customers.retrieve(id).catch(() => { return undefined })
        return !CUSTOMER.deleted ? CUSTOMER : undefined
    } catch (e) {
        return console.error('findCustomer(): ' + e.message)
    }
}

const createCustomer = async ({ userId: description, name, email }) => {
    try {
        await Joi.object().keys({
            description: Joi.string().alphanum().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required()
        }).required().validateAsync({ description, name, email })

        return await stripe.customers.create({ description, name, email })
    } catch (e) {
        return console.error('createCustomer(): ' + e.message)
    }
}

const updateCustomer = async (id, data) => {
    try {
        await Joi.object().keys({
            id: Joi.string().required(),
            data: Joi.object().required()
        }).required().validateAsync({ id, data })

        return await stripe.customers.update(id, data)
    } catch (e) {
        return console.error('updateCustomer(): ' + e.message)
    }
}

const deleteCustomer = async id => {
    try {
        await Joi.string().required().validateAsync(id)
        return await stripe.customers.del(id)
    } catch (e) {
        return console.error('deleteCustomer(): ' + e.message)
    }
}

module.exports = { listCustomers, findCustomer, createCustomer, updateCustomer, deleteCustomer }
