'use strict'
const { client } = require('../../config/discord')
const { newDiscordMember } = require('./controller')

client.on('guildMemberAdd', member => newDiscordMember(member))
