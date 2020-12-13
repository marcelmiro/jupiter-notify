'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findRoleByName, insertRole } = require('../../database/repositories/roles')
const { checkPermission } = require('../permissions')

module.exports = async (socket, role) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'roles', 'c')) {
            return socket.emit('send-error', 'You don\'t have permission to create a role.')
        }

        ['name', 'color', 'discordId'].forEach(key => { role[key] = role[key]?.trim() || undefined })

        try {
            await Joi.object().keys({
                name: Joi.string().required(),
                color: Joi.string(),
                discordId: Joi.number().unsafe(),
                transferable: Joi.boolean()
            }).required().validateAsync(role)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        if (await findRoleByName(role.name)) return socket.emit('send-error', 'Role already exists in database.')

        if (!await insertRole(role)) return socket.emit('send-error', 'Error on inserting restock to database.')
        console.log(`User '${socket.request.user.username}' created role '${role.name}'.`)
        socket.emit('add-role')
        await emitSocket('get-roles')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
