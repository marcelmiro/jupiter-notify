'use strict'
const Joi = require('joi')
const { findUser } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')
const { deleteUser } = require('../users')

module.exports = async ({ io, socket, userId }) => {
    try {
        if (!socket.request.role?.['modify_members']) return socket.emit('send-error', 'You don\'t have permission to delete a member.')

        try {
            await Joi.string().alphanum().required().validateAsync(userId)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const USER = await findUser(userId)
        if (!USER) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        const ROLE = await findRoleFromUserRole(userId)
        if (!ROLE) return socket.emit('send-error', 'User doesn\'t have a role.')

        const IMPORTANCE_ADMIN = socket.request.role.importance
        const IMPORTANCE_USER = ROLE.importance || 10
        if ((IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER) || IMPORTANCE_ADMIN > IMPORTANCE_USER) {
            return socket.emit('send-error', `You don't have permission to delete a user with '${ROLE.name}' role.`)
        }

        if (await deleteUser(userId)) {
            console.log(`User '${socket.request.user.username}' deleted user '${USER.username}'.`)
            io.sockets.emit('get-member-list')
            socket.emit('close-member-edit')
            socket.emit('send-message', `User '${USER.username}' has been deleted.`)
        } else socket.emit('send-error', 'Couldn\'t delete user role from database.')
    } catch (e) {
        console.error(e)
    }
}
