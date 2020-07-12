'use strict'
const client = require('../../config/database')
const model = require('../models/settings')

const listSettings = async () => {
    try {
        return (await client.query('SELECT * FROM settings')).rows
    } catch (e) {
        return console.error('listSettings(): ' + e.message)
    }
}

const findSetting = async name => {
    try {
        await model.name.validateAsync(name)
        return (await client.query('SELECT * FROM settings WHERE name = $1', [name])).rows[0]
    } catch (e) {
        return console.error('findSetting(): ' + e.message)
    }
}

const updateSetting = async (name, value) => {
    try {
        await model.schema.validateAsync({ name: name, value: value })
        if (!(await findSetting(name))) return console.error('updateSetting(): Setting name not found.')

        const RESPONSE = await client.query(`UPDATE settings SET value = '${value}' WHERE name = '${name}'`)
        if (RESPONSE) {
            process.env[name] = value
            return RESPONSE
        } else return undefined
    } catch (e) {
        return console.error('updateSetting(): ' + e.message)
    }
}

module.exports = { listSettings, findSetting, updateSetting }
