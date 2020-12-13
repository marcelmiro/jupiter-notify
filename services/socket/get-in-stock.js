'use strict'
const { checkPermission } = require('../permissions')

module.exports = async socket => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'restocks', 'r')) return

        socket.emit('set-in-stock', process.env.IN_STOCK)
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
