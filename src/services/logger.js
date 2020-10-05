'use strict'
const Joi = require('joi')
const { insertLog, deleteLogs } = require('../database/repositories/logs')

const logger = require('simple-node-logger').createSimpleLogger({ timestampFormat: 'YYYY-MM-DD HH:mm:ss' })

const clearLogs = async () => {
    try {
        const date = new Date()
        date.setDate(date.getDate() - (parseInt(process.env.LOGGER_RESET_DAYS) || 2))
        await deleteLogs(date.getTime())
    } catch (e) { console.fatal(e) }
}

const logMessage = async (level, message) => {
    try {
        try {
            await Joi.object().keys({
                level: Joi.string().required(),
                message: Joi.string().required()
            }).required().validateAsync({ level, message })
        } catch (e) { return }

        await insertLog({ level, message, created: new Date().getTime() })
        await logger[level](message instanceof Error ? message.stack : message)
    } catch (e) { console.fatal(e) }
}

module.exports = async () => {
    await clearLogs()

    console.log = msg => { logMessage('info', msg).then().catch(console.fatal) }
    console.info = msg => { logMessage('info', msg).then().catch(console.fatal) }
    console.warn = msg => { logMessage('warn', msg).then().catch(console.fatal) }
    console.error = msg => { logMessage('error', msg).then().catch(console.fatal) }
    console.fatal = msg => {
        // Exit process if console.fatal is called.
        logMessage('fatal', msg)
            .then(() => setTimeout(async () => await process.exit(1), 1000))
            .catch(() => process.exit(1))
    }

    console.log('Logger set up')
}
