'use strict'
const { listLogs } = require('../../database/repositories/logs')
const { checkPermission } = require('../permissions')

module.exports = async socket => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'members', 'r')) return

        const logs = []
        const dbLogs = await listLogs()
        if (!dbLogs) return socket.emit('send-error', 'Error on fetching logs from database.')

        for (const log of dbLogs) {
            if (!log.message || log.message.length === 0) continue

            log.message = log.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>').replace(/\r/g, '')
                .replace(/\s{4}/g, '&emsp;&emsp;')

            logs.push({
                id: log.log_id,
                level: log.level,
                message: log.message,
                created: log.created
            })
        }

        socket.emit('set-logs', logs)
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
