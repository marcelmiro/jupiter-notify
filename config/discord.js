'use strict'
const Discord = require('discord.js')
const client = new Discord.Client()

let guild
const setup = async () => {
    try {
        await client.login(process.env.DISCORD_BOT_TOKEN)
        guild = await new Promise(resolve => {
            client.on('ready', () => {
                console.log(`Discord bot logged in as ${client.user.tag}.`)
                resolve(client.guilds.cache.get(process.env.DISCORD_GUILD_ID))
            })
        })

        const { sendLogMessage } = require('../services/discord/utils')
        /* const TRUE_CONSOLE_LOG = console.log
        console.log = msg => {
            TRUE_CONSOLE_LOG(msg)
            utils.sendDiscordMessage(process.env.DISCORD_LOGGER_CHANNEL, 'INFO: ' + msg)
        } */
        const TRUE_CONSOLE_ERROR = console.error
        console.error = msg => {
            TRUE_CONSOLE_ERROR(msg)
            sendLogMessage('ERROR  ' + msg)
        }
    } catch (e) {
        console.error('Could not log in to Discord bot.')
        process.exit(1)
    }
}

module.exports = {
    setup,
    client,
    getGuild: () => { return guild }
}
