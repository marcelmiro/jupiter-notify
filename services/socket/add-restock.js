'use strict'
const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')
const { emitSocket } = require('./')
const { findRoleByName } = require('../../database/repositories/roles')
const { findRestock, insertRestock } = require('../../database/repositories/restocks')
const { listRolePermissions, checkPermission } = require('../permissions')

module.exports = async (socket, restock) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'restocks', 'c')) {
            return socket.emit('send-error', 'You don\'t have permission to create a restock.')
        }

        restock.role = restock.role?.trim() || undefined
        restock.stock = restock.stock || undefined
        restock.date = restock.date || undefined

        try {
            await Joi.object().keys({
                password: Joi.string().alphanum(),
                role: Joi.string().required(),
                stock: Joi.number().required(),
                date: Joi.number().unsafe()
            }).unknown().required().validateAsync(restock)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        if (restock.password?.length > 50) return socket.emit('send-error', 'Password length must not exceed 50 characters.')
        if (!restock.password) restock.password = uuidv4().replace(/-/g, '').slice(0, 8)

        if (await findRestock(restock.password)) return socket.emit('send-error', 'Restock with password already exists.')
        const role = await findRoleByName(restock.role)
        if (!role) return socket.emit('send-error', 'Role doesn\'t exist.')
        if (!restock.stock > 0) return socket.emit('send-error', 'Stock must be greater than 0.')

        const adminPermissions = await listRolePermissions(socket.request.role.role_id)
        const userImportance = role.importance || 1000
        if (
            !adminPermissions ||
            (
                !adminPermissions.administrator &&
                adminPermissions.importance >= userImportance
            )
        ) return socket.emit('send-error', `You don't have permission to create a restock with '${role.name}' role.`)

        if (!await insertRestock({
            password: restock.password,
            roleId: role.role_id,
            stock: restock.stock,
            date: restock.date
        })) return socket.emit('send-error', 'Error on inserting restock to database.')

        console.log(`User '${socket.request.user.username}' created restock '${restock.password}'.`)
        socket.emit('add-restock')
        await emitSocket('get-restocks')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
