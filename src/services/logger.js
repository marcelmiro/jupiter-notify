'use strict'
const Joi = require('joi')
const { insertLog, deleteLogs } = require('../database/repositories/logs')

const logger = require('simple-node-logger').createSimpleLogger({ timestampFormat: 'YYYY-MM-DD HH:mm:ss' })

const clearLogs = async () => {
    try {
        const date = new Date()
        date.setDate(date.getDate() - (parseInt(process.env.LOGGER_RESET_DAYS) || 5))
        await deleteLogs(date.getTime())
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
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
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

module.exports = async () => {
    await clearLogs()

    console.log = msg => { logMessage('info', msg).then().catch(console.error) }
    console.info = msg => { logMessage('info', msg).then().catch(console.error) }
    console.warn = msg => { logMessage('warn', msg).then().catch(console.error) }
    console.error = msg => { logMessage('error', msg).then() }

    console.log('Logger set up')
}
