'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findRole } = require('../../database/repositories/roles')
const { findRestock, updateRestock } = require('../../database/repositories/restocks')
const { listRolePermissions, checkPermission } = require('../permissions')

module.exports = async (socket, restock) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'restocks', 'u')) {
            return socket.emit('send-error', 'You don\'t have permission to edit a restock.')
        }

        restock.stock = restock.stock || undefined
        restock.date = restock.date || undefined

        try {
            await Joi.object().keys({
                password: Joi.string().alphanum().required(),
                stock: Joi.number(),
                date: Joi.number().unsafe()
            }).unknown().required().validateAsync(restock)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const dbRestock = await findRestock(restock.password)
        if (!dbRestock) return socket.emit('send-error', 'Restock doesn\'t exist in database.')
        const role = await findRole(dbRestock.role_id)

        const adminPermissions = await listRolePermissions(socket.request.role.role_id)
        const userImportance = role?.importance || 1000
        if (
            !adminPermissions ||
            (
                !adminPermissions.administrator &&
                adminPermissions.importance >= userImportance
            )
        ) return socket.emit('send-error', 'You don\'t have permission to edit this restock.')

        console.debug({ restockDate: restock.date, dbRestockDate: dbRestock.date })
        if (
            (
                restock.stock &&
                parseInt(restock.stock) !== parseInt(dbRestock.total) &&
                !await updateRestock(restock.password, 'stock', restock.stock)
            ) ||
            (
                (restock.date || dbRestock.date) &&
                restock.date?.toString() !== dbRestock.date?.toString() &&
                !await updateRestock(restock.password, 'date', restock.date)
            )
        ) return socket.emit('send-error', 'Error on updating restock from database.')

        console.log(`User '${socket.request.user.username}' updated restock '${restock.password}'.`)
        socket.emit('update-restock')
        await emitSocket('get-restocks')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
