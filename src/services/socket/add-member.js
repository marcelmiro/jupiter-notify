'use strict'
const Joi = require('joi')
const { findUser } = require('../../database/repositories/users')
const { findUserRole, insertUserRole } = require('../../database/repositories/user-roles')
const { findRoleByName } = require('../../database/repositories/roles')
const { addDiscordRole } = require('../discord/utils')

module.exports = async ({ io, socket, userId, role }) => {
    try {
        if (!socket.request.role?.modify_members) return socket.emit('send-error', 'You don\'t have permission to add a member.')

        try {
            await Joi.object().keys({
                userId: Joi.string().alphanum().required(),
                role: Joi.string().required()
            }).required().validateAsync({ userId, role })
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const USER = await findUser(userId)
        if (!USER) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        if (await findUserRole(userId)) return socket.emit('send-error', 'User already has a role.')

        const ROLE = await findRoleByName(role)
        if (!ROLE) return socket.emit('send-error', 'Role doesn\'t exist.')
        if (role.toLowerCase() === 'renewal') return socket.emit('send-error', 'You can\'t add members to the renewal role.')

        const IMPORTANCE_ADMIN = socket.request.role.importance
        const IMPORTANCE_USER = ROLE.importance || 10
        if ((IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER) || IMPORTANCE_ADMIN > IMPORTANCE_USER) {
            return socket.emit('send-error', `You don't have permission to add a user to '${ROLE.name}' role.`)
        }

        if (await insertUserRole(userId, ROLE.role_id)) {
            await addDiscordRole(userId, ROLE.role_id)
            console.log(`User '${socket.request.user.username}' added '${USER.username}' to '${ROLE.name}' role.`)
            io.sockets.emit('get-member-list')
            socket.emit('send-message', `User '${USER.username}' added to '${ROLE.name}' role.`)
        } else socket.emit('send-error', 'Couldn\'t insert user role to database.')
    } catch (e) {
        console.error(e)
    }
}
