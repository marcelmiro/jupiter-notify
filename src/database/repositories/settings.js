'use strict'
const client = require('../../config/database')
const model = require('../models/settings')

const listSettings = async () => {
    return (await client.query('SELECT * FROM settings')).rows
}

const findSetting = async name => {
    await model.name.validateAsync(name)
    return (await client.query('SELECT * FROM settings WHERE name = $1 LIMIT 1', [name])).rows[0]
}

const updateSetting = async (name, value) => {
    await model.schema.validateAsync({ name, value })
    if (!(await findSetting(name))) return

    const RESPONSE = await client.query('UPDATE settings SET value = $1 WHERE name = $2', [value, name])
    if (RESPONSE) { process.env[name] = value; return RESPONSE }
}

module.exports = { listSettings, findSetting, updateSetting }
