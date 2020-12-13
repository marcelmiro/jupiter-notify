'use strict'
const { listPlansAndRoles } = require('../../database/repositories/plans')
const { checkPermission } = require('../permissions')

module.exports = async socket => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'products', 'r')) return

        const products = []
        const dbProducts = await listPlansAndRoles()
        if (!dbProducts) return socket.emit('send-error', 'Error on fetching products from database.')

        for (const product of dbProducts) {
            products.push({
                id: product.plan_id,
                currency: product.currency,
                role: {
                    name: product.name,
                    color: product.color || undefined,
                    importance: product.importance || undefined
                }
            })
        }

        socket.emit('set-products', products)
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
