'use strict'
const client = require('../../config/database')
const model = require('../models/logs')

const listLogs = async () => {
    const logs = (await client.query('SELECT * FROM logs')).rows
    if (!logs) return []
    return logs.sort((a, b) => a.log_id - b.log_id)
}

const insertLog = async ({ level, message, created }) => {
    await model.insertLog.validateAsync({ level, message, created })
    return await client.query(
        'INSERT INTO logs (level, message, created) VALUES($1, $2, $3)',
        [level, message, created]
    )
}

const deleteLogs = async date => {
    await model.created.validateAsync(date)
    return await client.query('DELETE FROM logs WHERE created IS null OR created < $1', [date])
}

module.exports = { listLogs, insertLog, deleteLogs }
