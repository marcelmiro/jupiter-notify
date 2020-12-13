'use strict'
const Joi = require('joi')
const { findUser } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')
const { listRolePermissions, checkPermission } = require('../permissions')
const { findCustomer, updateSubscription } = require('../stripe')

module.exports = async (socket, userId) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'members', 'd')) {
            return socket.emit('send-error', 'You don\'t have permission to cancel a member\'s subscription.')
        }

        try {
            await Joi.string().alphanum().required().validateAsync(userId)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const [user, userRole] = await Promise.all([
            findUser(userId),
            findRoleFromUserRole(userId)
        ])
        if (!user) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        if (!userRole) return socket.emit('send-error', 'User doesn\'t have a role.')

        const adminPermissions = await listRolePermissions(socket.request.role.role_id)
        const userImportance = userRole.importance || 1000
        if (
            !adminPermissions ||
            (
                !adminPermissions.administrator &&
                adminPermissions.importance >= userImportance
            )
        ) return socket.emit('send-error', 'You don\'t have permission to delete this member.')

        const customer = await findCustomer(user.stripe_id)
        if (!customer) return socket.emit('send-error', `Customer '${user.stripe_id}' not found.`)
        const subscription = customer.subscriptions.data[0]
        if (!subscription) return socket.emit('send-error', 'Subscription not found.')

        if (subscription.cancel_at_period_end) return socket.emit('send-error', 'Subscription already canceled.')
        if (!await updateSubscription(
            subscription.id, { proration_behavior: 'none', cancel_at_period_end: true }
        )) return socket.emit('send-error', 'Error on updating subscription.')

        console.log(`User '${socket.request.user.username}' canceled user '${user.username}' subscription.`)
        socket.emit('update-member')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
