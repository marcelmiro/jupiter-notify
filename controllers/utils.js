'use strict'
const Joi = require('@hapi/joi')
const { customers: { findCustomer } } = require('../services/stripe')
const { findRoleFromUserRole } = require('../database/repositories/user-roles')

const isUser = async req => {
    try {
        await Joi.object().required().validateAsync(req)
        return req.user
    } catch (e) {
        return console.error('isUser(): ' + e.message)
    }
}

const isCustomer = async id => {
    try {
        await Joi.string().required().validateAsync(id)
        return await findCustomer(id)
    } catch (e) {
        return console.error('isCustomer(): ' + e.message)
    }
}

const hasMembership = async customer => {
    try {
        await Joi.object().required().validateAsync(customer)
        return customer.subscriptions.data[0]
    } catch (e) {
        return console.error('hasMembership(): ' + e.message)
    }
}

const hasRole = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
        return await findRoleFromUserRole(id)
    } catch (e) {
        return console.error('hasRole(): ' + e.message)
    }
}

module.exports = { isUser, isCustomer, hasMembership, hasRole }
