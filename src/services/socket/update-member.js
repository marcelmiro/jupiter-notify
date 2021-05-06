'use strict'
const Joi = require('joi')
const { findUser, findUserByStripe, updateUser } = require('../../database/repositories/users')
const { findRoleFromUserRole, updateUserRole } = require('../../database/repositories/user-roles')
const { findRoleByName } = require('../../database/repositories/roles')
const { listRoleIdsFromPlans } = require('../../database/repositories/plans')
const { findPlanByRoleAndCurrency } = require('../../database/repositories/plans')
const { listCustomers, findCustomer, createCustomer, deleteCustomer, createSubscription } = require('../stripe')
const { addDiscordRole, deleteDiscordRole } = require('../discord/utils')

const updateRoleFunction = async ({ socket, user, oldRoleId, newRoleName }) => {
    try {
        await Joi.object().keys({
            oldRoleId: [Joi.string().alphanum().required(), Joi.number().required()],
            newRoleName: Joi.string().required()
        }).required().validateAsync({ oldRoleId, newRoleName })
    } catch (e) { return socket.emit('send-error', 'Parameter validation failed.') }

    const newRole = await findRoleByName(newRoleName)
    if (!newRole?.role_id) return socket.emit('send-error', 'Desired role doesn\'t exist.')
    if (oldRoleId === newRole.role_id) return socket.emit('send-error', 'You can\'t update to the same role.')

    const PLAN_ROLES = await listRoleIdsFromPlans()
    if (PLAN_ROLES?.includes(oldRoleId)) return socket.emit('send-error', 'You can\'t change a subscription role.')
    if (PLAN_ROLES?.includes(newRole.role_id)) return socket.emit('send-error', 'You can\'t add a member to a subscription role.')

    if (await updateUserRole(user.user_id, newRole.role_id)) {
        if (await deleteDiscordRole(user.user_id, oldRoleId)) {
            await addDiscordRole(user.user_id, newRole.role_id)
        }
        console.log(`User '${socket.request.user.username}' changed '${user.username}' role to '${newRole.name}'.`)
        socket.emit('send-message', `User '${user.username}' role changed to '${newRole.name}'.`)
    } else socket.emit('send-error', 'Couldn\'t insert user role to database.')
}

const updateUserFunction = async ({ socket, user, name, value }) => {
    try {
        await Joi.object().keys({
            stripe_id: Joi.string(),
            email: Joi.string().email()
        }).or('stripe_id', 'email').required().validateAsync({ [name]: value })
    } catch (e) { return socket.emit('send-error', 'Parameter validation failed.') }

    if (name === 'stripe_id') {
        const CUSTOMERS = await listCustomers()
        if (!CUSTOMERS.find(CUSTOMER => CUSTOMER.id === value)) return socket.emit('send-error', 'Stripe id doesn\'t exist.')
        if (await findUserByStripe(user.stripe_id)) return socket.emit('send-error', 'Stripe id already assigned to a user.')
    }

    if (user[name] === value) return socket.emit('send-error', `You can't update ${name} to the same value.`)

    if (await updateUser(user.user_id, name, value)) {
        console.log(`User '${socket.request.user.username}' changed '${user.username}'s ${name}.`)
        socket.emit('send-message', `User '${user.username}'s ${name} has been updated.`)
    } else socket.emit('send-error', 'Couldn\'t update user data.')
}

const updateSubscriptionCurrencyFunction = async ({ socket, user, roleId, currency }) => {
    try {
        await Joi.string().alphanum().required().validateAsync(currency)
    } catch (e) { return socket.emit('send-error', 'Parameter validation failed.') }

    const PLAN = await findPlanByRoleAndCurrency(roleId, currency)
    if (!PLAN) return socket.emit('send-error', 'Couldn\'t find plan id.')

    const CUSTOMER = await findCustomer(user.stripe_id)
    if (!CUSTOMER) return socket.emit('send-error', 'Customer doesn\'t exist.')
    if (CUSTOMER.currency?.toLowerCase() === currency.toLowerCase()) return socket.emit('send-error', 'You can\'t update currency to the same value.')
    const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
    if (!SUBSCRIPTION) return socket.emit('send-error', 'User doesn\'t have a subscription.')

    if (!(await deleteCustomer(user.stripe_id))) return socket.emit('send-error', 'Error on deleting customer.')
    const CUSTOMER_ID = (await createCustomer({ userId: user.user_id, name: user.username, email: user.email }))?.id
    if (!CUSTOMER_ID) return socket.emit('send-error', 'Error on creating customer.')
    if (!(await updateUser(user.user_id, 'stripe_id', CUSTOMER_ID))) return socket.emit('send-error', 'Couldn\'t update stripe id in database.')

    if (await createSubscription({ customerId: CUSTOMER_ID, planId: PLAN.plan_id, date: SUBSCRIPTION.current_period_end })) {
        console.log(`User '${socket.request.user.username}' changed '${user.username}'s subscription currency to '${currency.toUpperCase()}'`)
        socket.emit('send-message', `User '${user.username}'s subscription currency has been updated.`)
    } else socket.emit('send-error', 'Couldn\'t create subscription.')
}

/* const updateTrialDaysFunction = async ({ socket, user, value }) => {
    const DAYS = Number(value)
    if (isNaN(DAYS) || DAYS % 1 !== 0) return socket.emit('send-error', 'Input must be an integer.')

    const CUSTOMER = await findCustomer(user.stripe_id)
    const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
    if (!SUBSCRIPTION) return socket.emit('send-error', 'User doesn\'t have a subscription.')

    if (DAYS > 0) {
        const DATE = new Date()
        DATE.setDate(DATE.getDate() + DAYS)
        if (await updateSubscription(SUBSCRIPTION.id, {
            proration_behavior: 'none',
            trial_end: Math.round(DATE.getTime() / 1000)
        })) {
            console.log(`User '${socket.request.user.username}' added ${DAYS} days to '${user.username}'s subscription.`)
            socket.emit('send-message', `User '${user.username}'s subscription trial days added.`)
        } else socket.emit('send-error', 'Couldn\'t update subscription to add trial.')
    } else if (!SUBSCRIPTION.trial_end) return socket.emit('send-error', 'Subscription already doesn\'t have a trial.')
    else if (await updateSubscription(SUBSCRIPTION.id, { proration_behavior: 'create_prorations', trial_end: 'now' })) {
        console.log(`User '${socket.request.user.username}' removed trial from '${user.username}'s subscription.`)
        socket.emit('send-message', `User '${user.username}'s subscription trial days removed.`)
    } else socket.emit('send-error', 'Couldn\'t update subscription to remove trial.')
} */

module.exports = async ({ io, socket, userId, name, value }) => {
    try {
        if (!socket.request.role?.modify_members) {
            socket.emit('close-member-edit')
            return socket.emit('send-error', 'You don\'t have permission to update a member\'s data.')
        }

        try {
            await Joi.object().keys({
                userId: Joi.string().alphanum().required(),
                name: Joi.string().required()
            }).required().validateAsync({ userId, name })
        } catch (e) { return socket.emit('send-error', 'Parameter validation failed.') }

        const USER = await findUser(userId)
        if (!USER) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        const ROLE = await findRoleFromUserRole(userId)
        if (!ROLE) return socket.emit('send-error', 'User doesn\'t have a role.')

        const IMPORTANCE_ADMIN = socket.request.role.importance
        const IMPORTANCE_USER = ROLE.importance || 10
        if ((IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER) || IMPORTANCE_ADMIN > IMPORTANCE_USER) {
            return socket.emit('send-error', `You don't have permission to update a user with '${ROLE.name}' role.`)
        }

        switch (name) {
        case 'role':
            await updateRoleFunction({ socket, user: USER, oldRoleId: ROLE.role_id, newRoleName: value })
            io.sockets.emit('get-member-list')
            break
        case 'email':
            await updateUserFunction({ socket, user: USER, name: 'email', value })
            break
        case 'stripeId':
            await updateUserFunction({ socket, user: USER, name: 'stripe_id', value })
            break
        case 'subscriptionCurrency':
            await updateSubscriptionCurrencyFunction({ socket, user: USER, roleId: ROLE.role_id, currency: value })
            break
            /* case 'subscriptionTrial':
                try {
                    await Joi.alternatives([Joi.number().required(), Joi.string().alphanum().required()]).required()
                        .validateAsync(value)
                } catch (e) { return socket.emit('send-error', 'Parameter validation failed.') }
                await updateTrialDaysFunction({ socket, user: USER, value })
                break */
        default:
            socket.emit('send-error', 'Field name doesn\'t exist.')
        }
    } catch (e) {
        console.error(e)
    }
}
