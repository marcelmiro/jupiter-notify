'use strict'
const { findUserRole } = require('../../database/repositories/user-roles')
const { addDiscordRole } = require('./utils')
const commands = require('./commands')

const newDiscordMember = async member => {
    try {
        if (!member?.constructor?.name || member.constructor.name !== 'GuildMember') return

        const ROLE = await findUserRole(member.user.id)
        if (!ROLE?.role_id) return
        return await addDiscordRole(member.user.id, ROLE.role_id)
    } catch (e) {
        console.error(e)
    }
}

const newDiscordMessage = async message => {
    try {
        if (message.author.bot) return
        if (message.channel.type === 'dm') await commands(message)
    } catch (e) {
        console.error(e)
    }
}

module.exports = { newDiscordMember, newDiscordMessage }
