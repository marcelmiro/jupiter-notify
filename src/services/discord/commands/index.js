'use strict'
const { findUserRole } = require('../../../database/repositories/user-roles')
const help = require('./help')
const generate = require('./generate')
const reset = require('./reset')
const logout = require('./logout')
const get = require('./get')

module.exports = async message => {
    if (!(await findUserRole(message.author.id))) return

    switch (message.content) {
    case '!help':
        await help(message)
        break
    case '!generate':
        await generate(message)
        break
    case '!reset':
        await reset(message)
        break
    case '!logout':
        await logout(message)
        break
    case '!get':
        await get(message)
        break
    }
}
