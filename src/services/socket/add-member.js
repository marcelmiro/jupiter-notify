'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findUser } = require('../../database/repositories/users')
const { findUserRole } = require('../../database/repositories/user-roles')
const { findRoleByName } = require('../../database/repositories/roles')
const { listPlans } = require('../../database/repositories/plans')
const { listRolePermissions, checkPermission } = require('../permissions')
const { addUser } = require('../users')
const { createSubscription } = require('../stripe')

module.exports = async (socket, member) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'members', 'c')) {
            return socket.emit('send-error', 'You don\'t have permission to add a member.')
        }

        member.role = member.role?.trim() || undefined
        member.trial = member.trial || undefined

        try {
            await Joi.object().keys({
                userId: Joi.string().alphanum().required(),
                role: Joi.string().required(),
                currency: Joi.string().alphanum(),
                trial: Joi.number()
            }).required().validateAsync(member)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const user = await findUser(member.userId)
        if (!user) return socket.emit('send-error', 'User doesn\'t exist in database.')
        if (await findUserRole(member.userId)) return socket.emit('send-error', 'User already has a role.')

        const role = await findRoleByName(member.role)
        if (!role) return socket.emit('send-error', 'Role doesn\'t exist.')

        const adminPermissions = await listRolePermissions(socket.request.role.role_id)
        const userImportance = role.importance || 1000
        if (
            !adminPermissions ||
            (
                !adminPermissions.administrator &&
                adminPermissions.importance >= userImportance
            )
        ) return socket.emit('send-error', `You don't have permission to add a user to '${role.name}' role.`)

        const plans = await listPlans()
        const planRoles = plans ? [...new Set(plans.map(plan => plan.role_id))] : undefined
        if (!planRoles) return socket.emit('send-error', 'Error fetching plans from database.')
        if (planRoles.includes(role.role_id)) {
            if (
                !member.currency ||
                !parseInt(member.trial) ||
                parseInt(member.trial) < 1
            ) return socket.emit('send-error', 'Parameter validation failed.')

            const plan = plans.find(
                plan => plan.role_id === role.role_id && plan.currency.toLowerCase() === member.currency.toLowerCase()
            )
            if (!plan) return socket.emit('send-error', 'Subscription product doesn\'t exist.')

            const date = new Date()
            date.setDate(date.getDate() + parseInt(member.trial))

            try {
                if (!await createSubscription({
                    customerId: user.stripe_id,
                    planId: plan.plan_id,
                    date: date.getTime() ? Math.floor(date.getTime() / 1000) : undefined
                })) return socket.emit('send-error', 'Error on creating subscription.')
            } catch (e) {
                return socket.emit('send-error', 'Error on creating subscription: ' + e.message)
            }
        }

        if (
            !await addUser(member.userId, role.role_id)
        ) return socket.emit('send-error', 'Error on adding user role to database.')

        console.log(`User '${socket.request.user.username}' added '${user.username}' to '${role.name}' role.`)
        socket.emit('add-member')
        await emitSocket('get-members')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
