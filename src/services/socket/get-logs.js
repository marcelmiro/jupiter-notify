'use strict'
const { listLogs } = require('../../database/repositories/logs')

const LOG_COLORS = {
    info: '#3FBF3F',
    warn: '#FFCC00',
    error: '#FF0000',
    fatal: '#9A63FF',
    default: '#FFFFFF'
}

module.exports = async socket => {
    try {
        if (!socket.request.role?.view_console) return socket.emit('send-error', 'You don\'t have permission to retrieve console logs.')

        const DB_LOGS = await listLogs()
        const LOGS = []

        for (let { level, message, created } of DB_LOGS) {
            if (!level || !message || message.length === 0) continue

            message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            message = message.replace(/\n/g, '<br>').replace(/\r/g, '')
            message = message.replace(/\s{4}/g, '&emsp;&emsp;')

            const TEMP_LOG = {
                level,
                message,
                color: LOG_COLORS[level.toLowerCase()] || LOG_COLORS.default || '#FFFFFF',
                time: created
            }

            LOGS.push(TEMP_LOG)
        }

        socket.emit('send-logs', LOGS)
    } catch (e) {
        console.error(e)
    }
}
