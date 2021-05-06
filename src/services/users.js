'use strict'
const Joi = require('joi')
const { findUser, insertUser, updateUser } = require('../database/repositories/users')
const { findUserRole, deleteUserRole } = require('../database/repositories/user-roles')
const { listCustomers, findCustomer, createCustomer, updateCustomer, deleteSubscription } = require('./stripe')
const { kickDiscordUser, deleteDiscordRole } = require('./discord/utils')

const validation = async ({ userId, username, email, avatarUrl }) => {
    try {
        return await Joi.object().keys({
            userId: Joi.string().alphanum().required(),
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            avatarUrl: Joi.string().required()
        }).required().validateAsync({ userId, username, email, avatarUrl })
    } catch (e) {}
}

const checkCustomer = async ({ dbUser, userId, username, email }) => {
    const DB_CUSTOMER = await findCustomer(dbUser.stripe_id)
    if (DB_CUSTOMER && DB_CUSTOMER.description === userId) return DB_CUSTOMER.id

    const CUSTOMERS = await listCustomers()
    const CUSTOMER = CUSTOMERS.find(c => c.description === userId)

    if (CUSTOMER) {
        await updateUser(userId, 'stripe_id', CUSTOMER.id)
        console.log(`Stripe id for user '${username}' changed.`)
        return CUSTOMER.id
    } else {
        const STRIPE_ID = (await createCustomer({ userId, name: username, email }))?.id
        if (!STRIPE_ID) throw new Error('Couldn\'t create new Stripe customer.')

        await updateUser(userId, 'stripe_id', STRIPE_ID)
        console.log(`Couldn't find customer linked to '${username}' so created new stripe customer.`)
        return STRIPE_ID
    }
}

const checkUserExists = async userId => {
    return Boolean((await findUser(userId))?.user_id)
}

const checkDifferences = async ({ userId, username, email, avatarUrl }) => {
    const dbUser = await findUser(userId)
    if (!dbUser) return

    if (dbUser.username !== username) {
        await updateUser(userId, 'username', username)
        await updateCustomer(dbUser.stripe_id, { name: username })
        dbUser.username = username
        console.log(`Username for user '${username}' changed.`)
    }
    if (dbUser.email !== email) {
        await updateUser(userId, 'email', email)
        await updateCustomer(dbUser.stripe_id, { email })
        dbUser.email = email
        console.log(`Email for user '${username}' changed.`)
    }
    if (dbUser.avatar_url !== avatarUrl) {
        await updateUser(userId, 'avatar_url', avatarUrl)
        dbUser.avatar_url = avatarUrl
        console.log(`Avatar for user '${username}' changed.`)
    }

    const STRIPE_ID = await checkCustomer({ dbUser, userId, username, email })
    if (STRIPE_ID) dbUser.stripe_id = STRIPE_ID

    return dbUser
}

const createUser = async ({ userId, username, email, avatarUrl }) => {
    const CUSTOMERS = await listCustomers()
    const CUSTOMER = CUSTOMERS.find(c => c.description === userId)
    const stripeId = CUSTOMER
        ? CUSTOMER.id
        : (await createCustomer({ userId, name: username, email }))?.id

    if (!stripeId) throw new Error('Couldn\'t create new Stripe customer.')
    const USER = await insertUser({ userId, stripeId, username, email, avatarUrl })

    if (USER) return USER
    else throw new Error('Couldn\'t insert user to database.')
}

const loginUser = async ({ userId, username, email, avatarUrl }) => {
    if (!(await validation({ userId, username, email, avatarUrl }))) return

    let user
    if (await checkUserExists(userId)) {
        user = await checkDifferences({ userId, username, email, avatarUrl })
        user.last_login = await updateUser(userId, 'last_login', new Date().getTime())
        console.log(`User '${username}' logged in.`)
    } else {
        user = await createUser({ userId, username, email, avatarUrl })
        console.log(`User '${username}' inserted in db.`)
    }

    return user
}

const deleteUser = async id => {
    await Joi.string().alphanum().required().validateAsync(id)

    const USER = await findUser(id)
    const USER_ROLE = USER ? await findUserRole(id) : undefined
    if (!USER_ROLE?.user_id) return

    const CUSTOMER = await findCustomer(USER.stripe_id)
    const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
    if (SUBSCRIPTION) await deleteSubscription(SUBSCRIPTION.id)

    const RESPONSE = await deleteUserRole(id)
    if (RESPONSE) {
        if (process.env.DISCORD_KICK_ON_CANCEL?.toLowerCase() === 'true') await kickDiscordUser(id, USER.username)
        else await deleteDiscordRole(id, USER_ROLE.role_id)
    }

    return RESPONSE
}

module.exports = { loginUser, deleteUser }
