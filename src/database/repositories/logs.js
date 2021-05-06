'use strict'
const client = require('../../config/database')
const model = require('../models/logs')

const listLogs = async () => {
    const LOGS = (await client.query('SELECT * FROM logs')).rows
    if (!LOGS) return

    return LOGS.sort((a, b) => a.log_id - b.log_id)
}

const insertLog = async ({ level, message, created = 0 }) => {
    try {
        await model.schema.validateAsync({ level, message, created })
    } catch (e) { return }

    return await client.query(
        'INSERT INTO logs (level, message, created) VALUES($1, $2, $3)',
        [level, message, created]
    )
}

const deleteLogs = async date => {
    try {
        await model.created.validateAsync(date)
    } catch (e) { return }

    return await client.query('DELETE FROM logs WHERE created IS null OR created < $1', [date])
}

module.exports = { listLogs, insertLog, deleteLogs }
