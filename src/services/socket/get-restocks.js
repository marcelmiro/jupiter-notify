'use strict'
const { listRestocksAndRoles } = require('../../database/repositories/restocks')
const { checkPermission } = require('../permissions')

module.exports = async socket => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'restocks', 'r')) return

        const restocks = []
        const dbRestocks = await listRestocksAndRoles()
        if (!dbRestocks) return socket.emit('send-error', 'Error on fetching restocks from database.')

        for (const restock of dbRestocks) {
            restocks.push({
                password: restock.password,
                total: restock.total,
                stock: restock.stock,
                date: restock.date || undefined,
                role: {
                    name: restock.name,
                    color: restock.color || undefined,
                    importance: restock.importance || undefined
                }
            })
        }

        socket.emit('set-restocks', restocks)
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
