'use strict'
const Joi = require('@hapi/joi')
const { findUser } = require('../../database/repositories/users')
const { findUserRole, insertUserRole } = require('../../database/repositories/user-roles')
const { listRoles } = require('../../database/repositories/roles')

module.exports = async ({ io, socket, userId, role }) => {
    try {
        if (!socket.request.role?.['modify_members']) return socket.emit('send-error', 'You don\'t have permission to add a member.')

        await Joi.object().keys({
            userId: Joi.string().alphanum().required(),
            role: Joi.string().alphanum().required()
        }).required().validateAsync({ userId, role })

        const USER = await findUser(userId)
        if (!USER) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        if (await findUserRole(userId)) return socket.emit('send-error', 'User already has a role.')

        const ROLES = await listRoles()
        if (!ROLES) return socket.emit('send-error', 'Error on getting list of roles.')
        const ROLE = ROLES.find(ROLE => ROLE.name.toLowerCase() === role.toLowerCase())
        if (!ROLE) return socket.emit('send-error', 'Role doesn\'t exist.')
        if (role.toLowerCase() === 'renewal') return socket.emit('send-error', 'You can\'t add the renewal role.')

        const IMPORTANCE_ADMIN = socket.request.role.importance
        const IMPORTANCE_USER = ROLE.importance || 10
        if ((IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER) || IMPORTANCE_ADMIN > IMPORTANCE_USER) {
            return socket.emit('send-error', `You don't have permission to delete a user with '${ROLE.name}'s role.`)
        }

        if (await insertUserRole(userId, ROLE.role_id)) {
            console.log(`User '${socket.request.user.username}' added '${USER.username}' to '${ROLE.name}'s role.`)
            io.sockets.emit('get-member-list')
            socket.emit('send-message', `User '${USER.username}' added to '${ROLE.name}'s role.`)
        } else socket.emit('send-error', 'Couldn\'t insert user role to database.')
    } catch (e) {
        console.error('Socket \'add-member\': ' + e.message)
        socket.emit('send-error', 'Error in socket \'add-member\'.')
    }
}
