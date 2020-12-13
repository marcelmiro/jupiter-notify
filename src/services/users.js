'use strict'
const Joi = require('joi')
const { findUser, insertUser, updateUser } = require('../database/repositories/users')
const { findUserRole, insertUserRole, deleteUserRole } = require('../database/repositories/user-roles')
const { findAccessToken, deleteAccessToken } = require('../database/repositories/access_tokens')
const { deleteSoftwareInstances } = require('../database/repositories/software_instances')
const { listCustomers, findCustomer, createCustomer, updateCustomer, deleteSubscription } = require('./stripe')
const { kickDiscordUser, addDiscordRole, deleteDiscordRole } = require('./discord/utils')

const validation = async ({ userId, username, email, avatarUrl }) => {
    try {
        return await Joi.object().keys({
            userId: Joi.string().alphanum().required(),
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            avatarUrl: Joi.string()
        }).validateAsync({ userId, username, email, avatarUrl })
    } catch (e) {}
}

const checkCustomer = async ({ dbUser, userId, username, email }) => {
    const dbCustomer = await findCustomer(dbUser.stripe_id)
    if (dbCustomer && dbCustomer.description === userId) return dbCustomer.id

    const customers = await listCustomers()
    const customer = customers.find(customer => customer.description === userId)

    if (customer) {
        await updateUser(userId, 'stripe_id', customer.id)
        console.log(`Stripe id for user '${username}' changed.`)
        return customer.id
    } else {
        const stripeId = (await createCustomer({ userId, name: username, email }))?.id
        if (!stripeId) throw new Error('Couldn\'t create new Stripe customer.')

        await updateUser(userId, 'stripe_id', stripeId)
        console.log(`Couldn't find customer linked to '${username}' so created new stripe customer.`)
        return stripeId
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

    const stripeId = await checkCustomer({ dbUser, userId, username, email })
    if (stripeId) dbUser.stripe_id = stripeId

    return dbUser
}

const createUser = async ({ userId, username, email, avatarUrl }) => {
    const customers = await listCustomers()
    const customer = customers.find(customer => customer.description === userId)
    const stripeId = customer
        ? customer.id
        : (await createCustomer({ userId, name: username, email }))?.id

    if (!stripeId) throw new Error('Couldn\'t create new Stripe customer.')
    if (!await insertUser({ userId, stripeId, username, email, avatarUrl })) {
        throw new Error('Error in inserting user to database.')
    }

    return await findUser(userId)
}

const loginUser = async ({ userId, username, email, avatarUrl }) => {
    if (!await validation({ userId, username, email, avatarUrl })) return

    let user
    if (await checkUserExists(userId)) {
        user = await checkDifferences({ userId, username, email, avatarUrl })
        await updateUser(userId, 'last_login', new Date().getTime())
        console.log(`User '${username}' logged in.`)
    } else {
        user = await createUser({ userId, username, email, avatarUrl })
        if (!user) throw new Error('Couldn\'t insert new user.')
        console.log(`User '${username}' inserted in db.`)
    }
    return user
}

const addUser = async (userId, roleId) => {
    try {
        await Joi.object().keys({
            userId: Joi.string().alphanum().required(),
            roleId: [Joi.number().required(), Joi.string().alphanum().required()]
        }).validateAsync({ userId, roleId })
    } catch (e) { return }

    const [user, userRole] = await Promise.all([
        findUser(userId),
        findUserRole(userId)
    ])
    if (!user || userRole) return

    if (!await insertUserRole(userId, roleId)) return
    await addDiscordRole(userId, roleId)
    return true
}

const deleteUser = async id => {
    await Joi.string().alphanum().required().validateAsync(id)

    const [user, userRole] = await Promise.all([
        findUser(id),
        findUserRole(id)
    ])
    if (!user || !userRole) return

    const customer = await findCustomer(user.stripe_id)
    const subscription = customer?.subscriptions.data[0]
    if (subscription) await deleteSubscription(subscription.id)

    if (!await deleteUserRole(id)) return

    const accessTokenObject = await findAccessToken(id)
    if (accessTokenObject) {
        await deleteSoftwareInstances(accessTokenObject.access_token)
        await deleteAccessToken(id)
    }

    if (process.env.DISCORD_KICK_ON_CANCEL?.toLowerCase() === 'true') await kickDiscordUser(id)
    else await deleteDiscordRole(id, userRole.role_id)

    return true
}

module.exports = { loginUser, addUser, deleteUser }
