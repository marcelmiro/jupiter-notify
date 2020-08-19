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
        /* const CONSOLE_LOG = console.log
        console.log = msg => {
            CONSOLE_LOG(msg)
            sendLogMessage('INFO  ' + msg)
        } */
        const CONSOLE_ERROR = console.error
        console.error = msg => {
            CONSOLE_ERROR(msg)
            sendLogMessage('ERROR  ' + msg)
        }

        require('../services/discord')
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
