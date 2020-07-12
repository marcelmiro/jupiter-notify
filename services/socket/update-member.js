'use strict'
const Joi = require('@hapi/joi')
const { findUser, findUserByStripe, updateUser } = require('../../database/repositories/users')
const { findRoleFromUserRole, updateUserRole } = require('../../database/repositories/user-roles')
const { listRoles } = require('../../database/repositories/roles')
const {
    customers: { listCustomers, findCustomer, createCustomer, deleteCustomer },
    subscriptions: { updateSubscription, transferSubscription }
} = require('../../services/stripe')

const updateRoleFunction = async ({ socket, user, role }) => {
    try {
        const ROLES = await listRoles()
        if (!ROLES) return socket.emit('send-error', 'Error on getting list of roles.')
        const ROLE = ROLES.find(ROLE => ROLE.name.toLowerCase() === role.toLowerCase())
        if (!ROLE) return socket.emit('send-error', 'Role doesn\'t exist.')
        if (role.toLowerCase() === 'renewal') return socket.emit('send-error', 'You can\'t add the renewal role.')

        if (ROLE.name.toLowerCase() === role.toLowerCase()) return socket.emit('send-error', 'You can\'t update to the same role.')

        if (await updateUserRole(user.user_id, ROLE.role_id)) {
            console.log(`User '${socket.request.user.username}' changed '${user.username}'s role to '${ROLE.name}'.`)
            socket.emit('send-message', `User '${user.username}'s role changed to '${ROLE.name}'.`)
        } else socket.emit('send-error', 'Couldn\'t insert user role to database.')
    } catch (e) {
        return console.error('updateRoleFunction(): ' + e.message)
    }
}

const updateUserFunction = async ({ socket, user, name, value }) => {
    try {
        if (name === 'stripe_id') {
            const CUSTOMERS = await listCustomers()
            if (!CUSTOMERS.find(CUSTOMER => CUSTOMER.id === value)) return socket.emit('send-error', 'Stripe id doesn\'t exist.')
            if (await findUserByStripe(user.stripe_id)) return socket.emit('send-error', 'Stripe id already assigned to a user.')
        } else if (name === 'email') await Joi.string().email().required().validateAsync(value)

        if (user[name] === value) return socket.emit('send-error', `You can't update ${name} to the same value.`)

        if (await updateUser(user.user_id, name, value)) {
            console.log(`User '${socket.request.user.username}' changed '${user.username}'s ${name}.`)
            socket.emit('send-message', `User '${user.username}'s ${name} has been updated.`)
        } else socket.emit('send-error', 'Couldn\'t update user data.')
    } catch (e) {
        return console.error('updateUserFunction(): ' + e.message)
    }
}

const updateSubscriptionCurrencyFunction = async ({ socket, user, value }) => {
    try {
        const CUSTOMER = await findCustomer(user.stripe_id)
        const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
        if (!SUBSCRIPTION) return socket.emit('send-error', 'User doesn\'t have a subscription.')

        if (CUSTOMER.currency.toLowerCase() === value.toLowerCase()) return socket.emit('send-error', 'You can\'t update currency to the same value.')
        if (!process.env['STRIPE_PLAN_ID_' + value.toUpperCase()]) return socket.emit('send-error', 'Currency doesn\'t exist.')

        if (!(await deleteCustomer(user.stripe_id))) return socket.emit('send-error', 'Error on deleting customer.')
        const CUSTOMER_ID = await createCustomer({ userId: user.user_id, name: user.username, email: user.email })
        if (!CUSTOMER_ID) return socket.emit('send-error', 'Error on creating customer.')
        if (!(await updateUser(user.user_id, 'stripe_id', CUSTOMER_ID))) return socket.emit('send-error', 'Couldn\'t update stripe id in database.')

        if (await transferSubscription({ customerId: CUSTOMER_ID, date: SUBSCRIPTION.current_period_end, currency: value.toUpperCase() })) {
            console.log(`User '${socket.request.user.username}' changed '${user.username}'s subscription currency to '${value.toUpperCase()}'`)
            socket.emit('send-message', `User '${user.username}'s subscription currency has been updated.`)
        } else socket.emit('send-error', 'Couldn\'t transfer subscription.')
    } catch (e) {
        return console.error('updateSubscriptionCurrencyFunction(): ' + e.message)
    }
}

const updateTrialDaysFunction = async ({ socket, user, value }) => {
    try {
        const DAYS = Number(value)
        await Joi.number().required().validateAsync(DAYS)
        if (DAYS % 1 !== 0) return socket.emit('send-error', 'Value must be a full number.')

        const CUSTOMER = await findCustomer(user.stripe_id)
        const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
        if (!SUBSCRIPTION) return socket.emit('send-error', 'User doesn\'t have a subscription.')

        if (DAYS > 0) {
            const DATE = new Date()
            DATE.setDate(DATE.getDate() + DAYS)
            if (await updateSubscription(SUBSCRIPTION.id, { proration_behavior: 'none', trial_end: Math.round(DATE.getTime()/1000) })) {
                console.log(`User '${socket.request.user.username}' added ${DAYS} days to '${user.username}'s subscription.`)
                socket.emit('send-message', `User '${user.username}'s subscription trial days added.`)
            } else socket.emit('send-error', 'Couldn\'t update subscription to add trial.')
        } else if (await updateSubscription(SUBSCRIPTION.id, { proration_behavior: 'create_prorations', trial_end: 'now' })) {
            console.log(`User '${socket.request.user.username}' remove trial from '${user.username}'s subscription.`)
            socket.emit('send-message', `User '${user.username}'s subscription trial days removed.`)
        } else socket.emit('send-error', 'Couldn\'t update subscription to remove trial.')
    } catch (e) {
        return console.error('updateTrialDaysFunction(): ' + e.message)
    }
}

module.exports = async ({ io, socket, userId, name, value }) => {
    try {
        if (!socket.request.role?.['modify_members']) return socket.emit('send-error', 'You don\'t have permission to update a member\'s data.')

        await Joi.object().keys({
            userId: Joi.string().alphanum().required(),
            name: Joi.string().required(),
            value: Joi.string().required()
        }).required().validateAsync({ userId, name, value })

        const USER = await findUser(userId)
        if (!USER) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        const ROLE = await findRoleFromUserRole(userId)
        if (!ROLE) return socket.emit('send-error', 'User doesn\'t have a role.')

        const IMPORTANCE_ADMIN = socket.request.role.importance
        const IMPORTANCE_USER = ROLE.importance || 10
        if ((IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER) || IMPORTANCE_ADMIN > IMPORTANCE_USER) {
            return socket.emit('send-error', `You don't have permission to update a user with '${ROLE.name}'s role.`)
        }

        switch (name) {
        case 'role':
            await updateRoleFunction({ socket, user: USER, role: ROLE })
            io.sockets.emit('get-member-list')
            break
        case 'email':
            await updateUserFunction({ socket, user: USER, name, value })
            break
        case 'stripe_id':
            await updateUserFunction({ socket, user: USER, name, value })
            break
        case 'cookie_id':
            await updateUserFunction({ socket, user: USER, name, value })
            break
        case 'subscription_currency':
            await updateSubscriptionCurrencyFunction({ socket, user: USER, value })
            break
        case 'trial_days':
            await updateTrialDaysFunction({ socket, user: USER, value })
            break
        default:
            socket.emit('send-error', 'Field name to update doesn\'t exist.')
        }
    } catch (e) {
        console.error('Socket \'update-member\': ' + e.message)
        socket.emit('send-error', 'Error in socket \'update-member\'.')
    }
}
