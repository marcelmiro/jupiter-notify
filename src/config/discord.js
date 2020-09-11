'use strict'
const Discord = require('discord.js')
const client = new Discord.Client()

let guilds = []
const setup = async () => {
    await client.login(process.env.DISCORD_BOT_TOKEN)

    // Set guild after bot has logged in.
    guilds = await new Promise(resolve => {
        client.on('ready', () => {
            console.log(`Discord bot logged in as ${client.user.tag}.`)
            const GUILD_IDS = process.env.DISCORD_GUILDS?.split(';').filter(Boolean)
            GUILD_IDS.forEach(guildId => {
                guilds.push(client.guilds.cache.get(guildId))
            })
            resolve(guilds.filter(Boolean))
        })
    })

    // Send log message if console.error or console.fatal are used.
    const { sendLogMessage } = require('../services/discord/utils')
    const CONSOLE_ERROR = console.error
    console.error = msg => { CONSOLE_ERROR(msg); sendLogMessage('ERROR  ' + msg) }
    const CONSOLE_FATAL = console.fatal
    console.fatal = msg => { CONSOLE_FATAL(msg); sendLogMessage('FATAL  ' + msg) }

    // Load discord events code.
    require('../services/discord')
}

module.exports = {
    setup,
    client,
    getGuilds: () => { return guilds },
    getGuild: () => { return guilds[0] }
}
