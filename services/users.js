'use strict'
const Joi = require('@hapi/joi')
const { findUser, insertUser, updateUser } = require('../database/repositories/users')
const { customers: { listCustomers, findCustomer, createCustomer, updateCustomer } } = require('./stripe')

const validation = async ({ userId, username, email, avatarUrl }) => {
    try {
        return await Joi.object().keys({
            userId: Joi.string().alphanum().required(),
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            avatarUrl: Joi.string().required()
        }).required().validateAsync({ userId, username, email, avatarUrl })
    } catch (e) {
        return console.error('validation(): ' + e.message)
    }
}

const stripeCustomerChecker = async ({ dbUser, userId, username, email }) => {
    try {
        const DB_CUSTOMER = await findCustomer(dbUser.stripe_id)
        if (DB_CUSTOMER && DB_CUSTOMER.description === userId) return DB_CUSTOMER

        const CUSTOMERS = await listCustomers()
        const CUSTOMER = CUSTOMERS.find(c => c.description === userId)
        if (CUSTOMER) {
            await updateUser(userId, 'stripe_id', CUSTOMER.id)
            console.log(`Stripe id for user '${username}' changed.`)
        } else {
            const STRIPE_ID = await createCustomer({ userId, name: username, email })
            await updateUser(userId, 'stripe_id', STRIPE_ID)
            console.log(`Couldn't find customer linked to '${username}' so created new stripe customer.`)
        }
        return true
    } catch (e) {
        return console.error('stripeCustomerChecker(): ' + e.message)
    }
}

const checkInDb = async userId => {
    try {
        const DB_USER = await findUser(userId)
        return Boolean(DB_USER)
    } catch (e) {
        return console.error('checkInDb(): ' + e.message)
    }
}

const checkDifferences = async ({ userId, username, email, avatarUrl }) => {
    try {
        const DB_USER = await findUser(userId)
        if (!DB_USER) return

        if (DB_USER.username !== username) {
            await updateUser(userId, 'username', username)
            await updateCustomer(DB_USER.stripe_id, { name: username })
            console.log(`Username for user '${username}' changed.`)
        }
        if (DB_USER.email !== email) {
            await updateUser(userId, 'email', email)
            await updateCustomer(DB_USER.stripe_id, { email })
            console.log(`Email for user '${username}' changed.`)
        }
        if (DB_USER.avatar_url !== avatarUrl) {
            await updateUser(userId, 'avatar_url', avatarUrl)
            console.log(`Avatar for user '${username}' changed.`)
        }
        await stripeCustomerChecker({ dbUser: DB_USER, userId, username, email })
        return true
    } catch (e) {
        return console.error('checkDifferences(): ' + e.message)
    }
}

const createUser = async ({ userId, username, email, avatarUrl }) => {
    try {
        const CUSTOMERS = await listCustomers()
        const CUSTOMER = CUSTOMERS.find(c => c.description === userId)
        const STRIPE_ID = CUSTOMER
            ? CUSTOMER.id
            : (await createCustomer({ userId, name: username, email }))?.id

        const USER = await insertUser({ userId, stripeId: STRIPE_ID, username, email, avatarUrl })
        if (USER) return USER
        return console.error('createUser(): Something went wrong.')
    } catch (e) {
        return console.error('createUser(): ' + e.message)
    }
}

const userLogin = async ({ userId, username, email, avatarUrl }) => {
    try {
        if (!(await validation({ userId, username, email, avatarUrl }))) return

        const IN_DB = await checkInDb(userId)
        if (IN_DB) {
            if (!(await checkDifferences({ userId, username, email, avatarUrl }))) return
            console.log(`User '${username}' logged in.`)
        } else if (IN_DB === false) {
            if (!(await createUser({ userId, username, email, avatarUrl }))) return
            console.log(`User '${username}' inserted in db.`)
        } else return

        return await findUser(userId)
    } catch (e) {
        return console.error('userLogin(): ' + e.message)
    }
}

module.exports = userLogin
