'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { findRoleByName } = require('../../database/repositories/roles')
const { findPlan, findPlanByRoleAndCurrency, insertPlan } = require('../../database/repositories/plans')
const { checkPermission } = require('../permissions')

module.exports = async (socket, product) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'products', 'c')) {
            return socket.emit('send-error', 'You don\'t have permission to create a product.')
        }

        product.id = product.id?.trim() || undefined
        product.role = product.role?.trim() || undefined

        try {
            await Joi.object().keys({
                id: Joi.string().required(),
                role: Joi.string().required(),
                currency: Joi.string().alphanum().length(3).required()
            }).required().validateAsync(product)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const role = await findRoleByName(product.role)
        if (!role) return socket.emit('send-error', 'Role doesn\'t exist.')

        if (await findPlan(product.id)) return socket.emit('send-error', 'Product id already exists in database.')
        if (
            await findPlanByRoleAndCurrency(role.role_id, product.currency)
        ) return socket.emit('send-error', 'A product with this role and currency already exists.')

        if (!await insertPlan({
            planId: product.id,
            roleId: role.role_id,
            currency: product.currency
        })) return socket.emit('send-error', 'Error on inserting product to database.')

        console.log(`User '${socket.request.user.username}' created product '${product.id}'.`)
        socket.emit('add-product')
        await emitSocket('get-products')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
