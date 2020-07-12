'use strict'
const fs = require('fs')
const Joi = require('@hapi/joi')

const validation = async () => {
    try {
        await Joi.string().required().validateAsync(process.env.LOGGER_NAME)
        await Joi.number().required().validateAsync(process.env.LOGGER_MAX_SIZE)
        await Joi.number().required().validateAsync(process.env.LOGGER_NEW_LINES)
    } catch (e) {
        console.error('Logger service failed validation:', e.message)
        process.exit(1)
    }
}

const clearLog = async () => {
    try {
        const STATS = await new Promise((resolve, reject) => {
            fs.stat(process.env.LOGGER_NAME, (err, stats) => {
                if (err) reject(err)
                resolve(stats)
            })
        })

        if (STATS.size <= parseInt(process.env.LOGGER_MAX_SIZE) * 1000) return
        let data = await new Promise((resolve, reject) => {
            fs.readFile(process.env.LOGGER_NAME, 'utf8', (err, data) => {
                if (err) reject(err)
                resolve(data)
            })
        })

        const NEW_LINES = parseInt(process.env.LOGGER_NEW_LINES)
        data = data.split('\n')
        data = data.length > NEW_LINES
            ? data.slice(data.length - NEW_LINES)
            : data.slice(data.length - data.length / 2)

        await new Promise((resolve, reject) => {
            fs.writeFile(process.env.LOGGER_NAME, data.join('\n'), err => {
                if (err) reject(err)
                resolve()
            })
        })
    } catch (e) {
        console.error('clearLog():', e.message)
        process.exit(1)
    }
}

validation().then(() => {
    const logger = require('simple-node-logger').createSimpleLogger({
        logFilePath: process.env.LOGGER_NAME,
        timestampFormat: 'YYYY-MM-DD HH:mm:ss'
    })

    console.log = msg => { clearLog().then(() => logger.info(msg)) }
    console.error = msg => { clearLog().then(() => logger.error(msg)) }
    console.log('Logger set up.')
})
