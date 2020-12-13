'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findRole, updateRole } = require('../../database/repositories/roles')
const { findPermissions, insertPermission, updatePermission } = require('../../database/repositories/permissions')
const { listRolePermissions, checkPermission } = require('../permissions')

module.exports = async (socket, role) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'roles', 'u')) {
            return socket.emit('send-error', 'You don\'t have permission to edit a role.')
        }

        for (const key of ['name', 'color', 'discordId']) { role[key] = role[key]?.trim() || undefined }
        for (const key of ['stats', 'members', 'roles', 'restocks', 'products', 'logs', 'settings']) {
            role.permissions[key] = role.permissions[key]?.trim() || undefined
        }
        role.permissions.importance = role.permissions.importance || undefined

        try {
            await Joi.object().keys({
                id: Joi.number().required(),
                name: Joi.string().required(),
                color: Joi.string(),
                discordId: Joi.number().unsafe(),
                transferable: Joi.boolean(),
                permissions: Joi.object().keys({
                    importance: Joi.number(),
                    administrator: Joi.boolean(),
                    stats: Joi.string(),
                    members: Joi.string(),
                    roles: Joi.string(),
                    restocks: Joi.string(),
                    products: Joi.string(),
                    logs: Joi.string(),
                    settings: Joi.string()
                }).required()
            }).required().validateAsync(role)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const dbRole = await findRole(role.id)
        if (!dbRole) return socket.emit('send-error', 'Role doesn\'t exist in database.')

        const adminPermissions = await listRolePermissions(socket.request.role.role_id)
        const userImportance = dbRole.importance || 1000
        if (
            !adminPermissions ||
            (
                !adminPermissions.administrator &&
                adminPermissions.importance >= userImportance
            )
        ) return socket.emit('send-error', 'You don\'t have permission to edit this role.')

        if (
            (
                role.name &&
                dbRole.name !== role.name &&
                !await updateRole(role.id, 'name', role.name)
            ) ||
            (
                (dbRole.color || role.color) &&
                dbRole.color !== role.color &&
                !await updateRole(role.id, 'color', role.color)
            ) ||
            (
                (dbRole.discord_id || role.discordId) &&
                dbRole.discord_id !== role.discordId &&
                !await updateRole(role.id, 'discord_id', role.discordId)
            ) ||
            (
                (dbRole.transferable || role.transferable) &&
                dbRole.transferable !== role.transferable &&
                !await updateRole(role.id, 'transferable', role.transferable)
            )
        ) return socket.emit('send-error', 'Error on updating role from database.')

        if (!await findPermissions(role.id)) await insertPermission(role.id)

        if (
            adminPermissions.administrator &&
            (
                (
                    (dbRole.importance || role.permissions.importance) &&
                    dbRole.importance !== role.permissions.importance &&
                    !await updatePermission(role.id, 'importance', role.permissions.importance)
                ) ||
                (
                    (dbRole.administrator || role.permissions.administrator) &&
                    dbRole.administrator !== role.permissions.administrator &&
                    !await updatePermission(role.id, 'administrator', role.permissions.administrator)
                ) ||
                (
                    (dbRole.stats || role.permissions.stats) &&
                    dbRole.stats !== role.permissions.stats &&
                    !await updatePermission(role.id, 'stats', role.permissions.stats)
                ) ||
                (
                    (dbRole.members || role.permissions.members) &&
                    dbRole.members !== role.permissions.members &&
                    !await updatePermission(role.id, 'members', role.permissions.members)
                ) ||
                (
                    (dbRole.roles || role.permissions.roles) &&
                    dbRole.roles !== role.permissions.roles &&
                    !await updatePermission(role.id, 'roles', role.permissions.roles)
                ) ||
                (
                    (dbRole.restocks || role.permissions.restocks) &&
                    dbRole.restocks !== role.permissions.restocks &&
                    !await updatePermission(role.id, 'restocks', role.permissions.restocks)
                ) ||
                (
                    (dbRole.products || role.permissions.products) &&
                    dbRole.products !== role.permissions.products &&
                    !await updatePermission(role.id, 'products', role.permissions.products)
                ) ||
                (
                    (dbRole.logs || role.permissions.logs) &&
                    dbRole.logs !== role.permissions.logs &&
                    !await updatePermission(role.id, 'logs', role.permissions.logs)
                ) ||
                (
                    (dbRole.settings || role.permissions.settings) &&
                    dbRole.settings !== role.permissions.settings &&
                    !await updatePermission(role.id, 'settings', role.permissions.settings)
                )
            )
        ) return socket.emit('send-error', 'Error on updating role permissions from database.')

        console.log(`User '${socket.request.user.username}' updated role '${role.name}'.`)
        socket.emit('update-role')
        await emitSocket('get-roles')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
