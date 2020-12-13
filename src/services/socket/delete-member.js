'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findUser } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')
const { listRolePermissions, checkPermission } = require('../permissions')
const { deleteUser } = require('../users')

module.exports = async (socket, userId) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'members', 'd')) {
            return socket.emit('send-error', 'You don\'t have permission to delete a member.')
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

        if (!await deleteUser(userId)) return socket.emit('send-error', 'Error on deleting user from database.')
        console.log(`User '${socket.request.user.username}' deleted user '${user.username}'.`)
        socket.emit('delete-member')
        await emitSocket('get-members')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
