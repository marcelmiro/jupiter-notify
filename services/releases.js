'use strict'
const Joi = require('@hapi/joi')

const getRelease = async () => {
    try {
        if (process.env.IN_STOCK.toLowerCase() === 'true' && process.env.RELEASE_STOCK && process.env.RELEASE_TOTAL_STOCK) {
            const DATA = {
                releaseStock: process.env.RELEASE_STOCK,
                releaseTotalStock: process.env.RELEASE_TOTAL_STOCK
            }

            await Joi.object().keys({
                releaseStock: Joi.number().required(),
                releaseTotalStock: Joi.number().required()
            }).required().validateAsync(DATA)

            return DATA
        } else return undefined
    } catch (e) {
        return console.error('getRelease(): ' + e.message)
    }
}

const createRelease = async number => {
    try {
        await Joi.number().required().validateAsync(number)
        process.env.IN_STOCK = 'true'
        process.env.RELEASE_STOCK = number.toString()
        process.env.RELEASE_TOTAL_STOCK = number.toString()
        return number
    } catch (e) {
        return console.error('createRelease(): ' + e.message)
    }
}

const deleteRelease = async () => {
    try {
        process.env.IN_STOCK = 'false'
        delete process.env.RELEASE_STOCK
        delete process.env.RELEASE_TOTAL_STOCK
        return true
    } catch (e) {
        return console.error('deleteRelease(): ' + e.message)
    }
}

module.exports = { getRelease, createRelease, deleteRelease }
