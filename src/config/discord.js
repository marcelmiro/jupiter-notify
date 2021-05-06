'use strict'
const Discord = require('discord.js')
const client = new Discord.Client()

let guild
const setup = async () => {
    await client.login(process.env.DISCORD_BOT_TOKEN)

    // Set guild after bot has logged in.
    guild = await new Promise((resolve, reject) => {
        client.on('ready', () => {
            const guildId = process.env.DISCORD_GUILD
            if (!guildId) reject(new Error('DISCORD_GUILD settings doesn\'t exist.'))
            const guild = client.guilds.cache.get(guildId)
            if (!guild) reject(new Error('Discord bot is not a member of the guild\'s id setting.'))

            resolve(guild)
        })
    })
    console.log(`Discord bot logged in as ${client.user.tag}`)

    // Send log message if console.error is used.
    const { sendLogMessage } = require('../services/discord/utils')
    const CONSOLE_ERROR = console.error
    console.error = msg => { CONSOLE_ERROR(msg); sendLogMessage('error', msg instanceof Error ? msg.stack : msg) }

    // Load discord events code.
    require('../services/discord')
}

module.exports = {
    setup,
    client,
    getGuild: () => { return guild }
}
