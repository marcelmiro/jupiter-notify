'use strict'
const { listSettings } = require('../../database/repositories/settings')

module.exports = async socket => {
    try {
        if (!socket.request.role?.edit_config) return socket.emit('send-error', 'You don\'t have permission to retrieve website\'s settings.')

        const SETTINGS = {}
        const DB_SETTINGS = await listSettings()

        for (const { name, value } of DB_SETTINGS) {
            SETTINGS[name] = value
        }

        socket.emit('set-settings', SETTINGS)
    } catch (e) {
        console.error(e)
    }
}
