'use strict'
const fs = require('fs')

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

        const UNFILTERED_LOGS = await new Promise((resolve, reject) => {
            fs.readFile(process.env.LOGGER_NAME, 'utf8', (err, data) => {
                if (err) reject(err)
                resolve(data)
            })
        })

        const TEMP_LOGS = []
        const LOGS = UNFILTERED_LOGS.split(/\n(?=\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s)/)
        for (let log of LOGS) {
            log = log.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            log = log.replace(/\n/g, '<br>').replace(/\r/g, '')
            log = log.replace(/\s{4}/g, '&emsp;&emsp;')

            const TEMP = { time: log.split(' ', 2).join(' ') }

            TEMP.text = log.substr(TEMP.time.length).split(' ').filter(Boolean)
            if (TEMP.text.length === 0) continue

            TEMP.status = TEMP.text[0]
            TEMP.text = TEMP.text.slice(1).join(' ')
            TEMP.color = TEMP.status.toLowerCase() in LOG_COLORS
                ? LOG_COLORS[TEMP.status.toLowerCase()]
                : LOG_COLORS.default || '#FFFFFF'

            TEMP_LOGS.push(TEMP)
        }

        socket.emit('send-logs', TEMP_LOGS)
    } catch (e) {
        console.error(e)
    }
}
