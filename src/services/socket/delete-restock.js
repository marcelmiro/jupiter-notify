'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findRole } = require('../../database/repositories/roles')
const { findRestock, deleteRestock } = require('../../database/repositories/restocks')
const { listRolePermissions, checkPermission } = require('../permissions')

module.exports = async (socket, password) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'restocks', 'd')) {
            return socket.emit('send-error', 'You don\'t have permission to delete a restock.')
        }

        try {
            await Joi.string().alphanum().required().validateAsync(password)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const restock = await findRestock(password)
        if (!restock) return socket.emit('send-error', 'Restock doesn\'t exist in database.')
        const role = await findRole(restock.role_id)

        const adminPermissions = await listRolePermissions(socket.request.role.role_id)
        const userImportance = role?.importance || 1000
        if (
            !adminPermissions ||
            (
                !adminPermissions.administrator &&
                adminPermissions.importance >= userImportance
            )
        ) return socket.emit('send-error', 'You don\'t have permission to delete this restock.')

        if (!await deleteRestock(password)) return socket.emit('send-error', 'Error on deleting restock from database.')
        console.log(`User '${socket.request.user.username}' deleted restock '${password}'.`)
        socket.emit('delete-restock')
        await emitSocket('get-restocks')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
