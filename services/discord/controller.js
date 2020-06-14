'use strict'
const { findUserRole } = require('../../database/repositories/user-roles')
const { addDiscordRole } = require('./utils')

const newDiscordMember = async (member) => {
    try {
        if (!member?.constructor?.name || member.constructor.name !== 'GuildMember') {
            return console.error('newDiscordMember(): Parameter is invalid.')
        }

        const ROLE = await findUserRole(member.user.id)
        if (!ROLE?.['role_id']) return
        return addDiscordRole(member.user.id, ROLE.role_id)
    } catch (e) {
        return console.error('newDiscordMember(): ' + e.message)
    }
}

module.exports = { newDiscordMember }
