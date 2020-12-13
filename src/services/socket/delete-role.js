'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { listUserRoles, deleteUserRoleByRole } = require('../../database/repositories/user-roles')
const { findRole, deleteRole } = require('../../database/repositories/roles')
const { listRoleIdsFromPlans, deletePlanByRole } = require('../../database/repositories/plans')
const { deleteRestockByRole } = require('../../database/repositories/restocks')
const { listRolePermissions, checkPermission } = require('../permissions')
const { deleteUser } = require('../users')

module.exports = async (socket, roleId) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'roles', 'd')) {
            return socket.emit('send-error', 'You don\'t have permission to delete a role.')
        }

        try {
            await Joi.number().required().validateAsync(roleId)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const role = await findRole(roleId)
        if (!role) return socket.emit('send-error', 'Role doesn\'t exist in database.')

        const adminPermissions = await listRolePermissions(socket.request.role.role_id)
        const userImportance = role.importance || 1000
        if (
            !adminPermissions ||
            (
                !adminPermissions.administrator &&
                adminPermissions.importance >= userImportance
            )
        ) return socket.emit('send-error', 'You don\'t have permission to delete this role.')

        if (
            !await deleteRestockByRole(roleId)
        ) return socket.emit('send-error', 'Error on deleting restocks from database.')

        const planRoles = await listRoleIdsFromPlans()
        if (planRoles?.includes(roleId)) {
            if (
                !await deletePlanByRole(roleId)
            ) return socket.emit('send-error', 'Error on deleting plans from database.')

            const userRoles = await listUserRoles(roleId)
            try {
                await Joi.array().items(
                    Joi.string().alphanum().required()
                ).required().validateAsync(userRoles)
            } catch (e) { return socket.emit('send-error', 'Error on fetching user roles from database: ' + e.message) }
            await Promise.all(userRoles.map(userRole => userRole.user_id).map(deleteUser))
        } else if (
            !await deleteUserRoleByRole(roleId)
        ) return socket.emit('send-error', 'Error on deleting user roles from database.')

        if (!await deleteRole(roleId)) return socket.emit('send-error', 'Error on deleting role from database.')

        console.log(`User '${socket.request.user.username}' deleted role '${role.name}'.`)
        socket.emit('delete-role')
        await Promise.all(['get-members', 'get-restocks', 'get-roles', 'get-products'].map(emitSocket))
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
