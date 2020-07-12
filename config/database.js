'use strict'
const Client = require('pg').Client

let client
const setup = async () => {
    try {
        client = new Client(process.env.DATABASE_URL)
        await client.connect()
        console.log('Database opened.')
    } catch (e) {
        console.error('Could not open database.')
        process.exit(1)
    }
    try {
        const SETTINGS = (await client.query('SELECT name, value FROM settings')).rows
        SETTINGS.forEach(({ name, value }) => {
            process.env[name] = value
        })
        console.log('Website config loaded.')
        return true
    } catch (e) {
        console.error('Could not load website config.')
        process.exit(1)
    }
}

module.exports = {
    setup,
    query: (text, params, callback) => {
        return client.query(text, params, callback)
    }
}
