'use strict'
const Joi = require('@hapi/joi')
const { findUser } = require('../../database/repositories/users')
const { findRoleFromUserRole, deleteUserRole } = require('../../database/repositories/user-roles')
const { customers: { findCustomer }, subscriptions: { deleteSubscription } } = require('../../services/stripe')
const { kickDiscordUser } = require('../../services/discord/utils')

module.exports = async ({ io, socket, userId }) => {
    try {
        if (!socket.request.role?.['modify_members']) return socket.emit('send-error', 'You don\'t have permission to delete a member.')

        await Joi.string().alphanum().required().validateAsync(userId)

        const USER = await findUser(userId)
        if (!USER) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        const ROLE = await findRoleFromUserRole(userId)
        if (!ROLE) return socket.emit('send-error', 'User doesn\'t have a role.')

        const IMPORTANCE_ADMIN = socket.request.role.importance
        const IMPORTANCE_USER = ROLE.importance || 10
        if ((IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER) || IMPORTANCE_ADMIN > IMPORTANCE_USER) {
            return socket.emit('send-error', `You don't have permission to delete a user with '${ROLE.name}'s role.`)
        }

        if (ROLE.name.toLowerCase() === 'renewal') {
            const CUSTOMER = findCustomer(USER.stripe_id)
            const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
            if (SUBSCRIPTION) await deleteSubscription(SUBSCRIPTION.id)
        }

        if (await deleteUserRole(userId)) {
            console.log(`User '${socket.request.user.username}' deleted user '${USER.username}'.`)
            io.sockets.emit('get-member-list')
            socket.emit('send-message', `User '${USER.username}' has been deleted.`)
            await kickDiscordUser(userId)
        } else socket.emit('send-error', 'Couldn\'t delete user role from database.')
    } catch (e) {
        console.error('Socket \'delete-member\': ' + e.message)
        socket.emit('send-error', 'Error in socket \'delete-member\'.')
    }
}
