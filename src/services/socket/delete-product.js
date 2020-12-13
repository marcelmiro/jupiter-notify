'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findRole } = require('../../database/repositories/roles')
const { findPlan, deletePlan } = require('../../database/repositories/plans')
const { listRolePermissions, checkPermission } = require('../permissions')

module.exports = async (socket, productId) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'products', 'd')) {
            return socket.emit('send-error', 'You don\'t have permission to delete a product.')
        }

        productId = productId?.trim() || undefined

        try {
            await Joi.string().required().validateAsync(productId)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const product = await findPlan(productId)
        if (!product) return socket.emit('send-error', 'Product doesn\'t exist in database.')
        const role = await findRole(product.role_id)

        const adminPermissions = await listRolePermissions(socket.request.role.role_id)
        const userImportance = role?.importance || 1000
        if (
            !adminPermissions ||
            (
                !adminPermissions.administrator &&
                adminPermissions.importance >= userImportance
            )
        ) return socket.emit('send-error', 'You don\'t have permission to delete this product.')

        if (!await deletePlan(productId)) return socket.emit('send-error', 'Error on deleting product from database.')
        console.log(`User '${socket.request.user.username}' deleted product '${productId}'.`)
        socket.emit('delete-product')
        await emitSocket('get-products')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
