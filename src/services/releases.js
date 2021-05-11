'use strict'
const Joi = require('joi')
const { inStock } = require('../utils')

const getRelease = async () => {
    const DATA = {}

    if (
        await inStock() &&
        process.env.RELEASE_STOCK &&
        process.env.RELEASE_TOTAL_STOCK
    ) {
        if (parseInt(process.env.RELEASE_STOCK)) DATA.stock = parseInt(process.env.RELEASE_STOCK)
        if (parseInt(process.envi.RELEASE_STOCK)) DATA.total = parseInt(process.env.RELEASE_TOTAL_STOCK)
    }

    return DATA
}

const createRelease = async number => {
    try {
        await Joi.number().required().validateAsync(number)
    } catch (e) { return }

    process.env.IN_STOCK = 'true'
    process.env.RELEASE_STOCK = number.toString()
    process.env.RELEASE_TOTAL_STOCK = number.toString()
    return number
}

const deleteRelease = async () => {
    process.env.IN_STOCK = 'false'
    delete process.env.RELEASE_STOCK
    delete process.env.RELEASE_TOTAL_STOCK
    return true
}

const useRelease = async () => {
    const RELEASE = await getRelease()
    if (!RELEASE || RELEASE.stock <= 0) { await deleteRelease(); return }

    RELEASE.stock -= 1
    process.env.RELEASE_STOCK = RELEASE.stock.toString()

    if (RELEASE.stock === 0) await deleteRelease()
    return RELEASE
}

module.exports = { getRelease, createRelease, deleteRelease, useRelease }
