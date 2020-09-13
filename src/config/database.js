'use strict'
const Client = require('pg').Client

let client
const setup = async () => {
    client = new Client(process.env.DATABASE_URL)
    await client.connect()
    console.log('Database opened.')

    // Load website settings.
    const SETTINGS = (await client.query('SELECT name, value FROM settings')).rows
    SETTINGS.forEach(({ name, value }) => {
        process.env[name] = value
    })
    console.log('Website config loaded.')

    return true
}

module.exports = {
    setup,
    query: (text, params, callback) => {
        return client.query(text, params, callback)
    }
}
