'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findUser, updateUser } = require('../../database/repositories/users')
const { findRoleFromUserRole, updateUserRole } = require('../../database/repositories/user-roles')
const { findRoleByName } = require('../../database/repositories/roles')
const { listRoleIdsFromPlans } = require('../../database/repositories/plans')
const { findPlanByRoleAndCurrency } = require('../../database/repositories/plans')
const { listRolePermissions, checkPermission } = require('../permissions')
const { findCustomer, createCustomer, deleteCustomer, createSubscription } = require('../stripe')
const { addDiscordRole, deleteDiscordRole } = require('../discord/utils')

module.exports = async (socket, member) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'members', 'u')) {
            return socket.emit('send-error', 'You don\'t have permission to edit a member.')
        }

        member.role = member.role?.trim() || undefined

        try {
            await Joi.object().keys({
                userId: Joi.string().alphanum().required(),
                role: Joi.string(),
                currency: Joi.string().alphanum()
            }).required().validateAsync(member)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const [user, userRole] = await Promise.all([
            findUser(member.userId),
            findRoleFromUserRole(member.userId)
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
        ) return socket.emit('send-error', 'You don\'t have permission to edit this member.')

        if (member.role && userRole.name.toLowerCase() !== member.role.toLowerCase()) {
            const newRole = await findRoleByName(member.role)
            if (!newRole) return socket.emit('send-error', 'New role doesn\'t exist.')
            if (userRole.role_id === newRole.role_id) return

            const planRoles = await listRoleIdsFromPlans()
            if (planRoles) {
                if (planRoles.includes(userRole.role_id)) {
                    return socket.emit(
                        'send-error',
                        'You must cancel the member\'s subscription before adding the member to a new role.'
                    )
                }
                if (planRoles.includes(newRole.role_id)) {
                    return socket.emit(
                        'send-error',
                        'You have to delete the member before adding the member to a subscription role.'
                    )
                }
            }

            if (!await updateUserRole(member.userId, newRole.role_id)) {
                return socket.emit('send-error', 'Error on adding user role to database.')
            }
            await deleteDiscordRole(member.userId, userRole.role_id)
            await addDiscordRole(member.userId, newRole.role_id)

            console.log(`User '${socket.request.user.username}' changed '${user.username}' role to '${newRole.name}'.`)
            socket.emit('send-message', `User '${user.username}' role changed to '${newRole.name}'.`)
            socket.emit('update-member')
            return await emitSocket('get-members')
        }

        const customer = await findCustomer(user.stripe_id)
        if (!customer) return socket.emit('send-error', `Customer '${user.stripe_id}' not found.`)
        if (
            member.currency &&
            customer.subscriptions.data[0] &&
            customer.currency.toLowerCase() !== member.currency.toLowerCase()
        ) {
            const plan = await findPlanByRoleAndCurrency(userRole.role_id, member.currency)
            if (!plan) return socket.emit('send-error', 'New plan not found.')

            if (customer.currency?.toLowerCase() === member.currency.toLowerCase()) {
                return socket.emit('send-error', 'You can\'t update subscription to the same currency.')
            }

            const subscription = customer.subscriptions.data[0]
            if (!subscription) return socket.emit('send-error', 'User doesn\'t have a subscription.')

            const customerId = (
                await createCustomer({ userId: member.userId, name: user.username, email: user.email })
            )?.id
            if (!customerId) return socket.emit('send-error', 'Error on creating customer.')
            if (!await deleteCustomer(user.stripe_id)) return socket.emit('send-error', 'Error on deleting customer.')
            if (!await updateUser(member.userId, 'stripe_id', customerId)) {
                return socket.emit('send-error', 'Couldn\'t update stripe id in database.')
            }

            const newSubscription = await createSubscription({
                customerId,
                planId: plan.plan_id,
                date: subscription.current_period_end
            })

            if (!newSubscription) return socket.emit('send-error', 'Couldn\'t create subscription.')
            console.log(
                `User '${socket.request.user.username}' changed '${user.username}' subscription currency ` +
                `to '${member.currency.toUpperCase()}'`
            )
            socket.emit(
                'send-message',
                `User '${user.username}' subscription currency changed to '${member.currency.toUpperCase()}'.`
            )
        }

        socket.emit('update-member')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
