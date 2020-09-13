'use strict'
const { client } = require('../../config/discord')
const { newDiscordMember, newDiscordMessage } = require('./controller')

client.on('guildMemberAdd', member => newDiscordMember(member))
client.on('message', message => newDiscordMessage(message))
