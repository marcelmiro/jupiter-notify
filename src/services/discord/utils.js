'use strict'
const Joi = require('joi')
const { findRole, findRoleByName } = require('../../database/repositories/roles')
const guild = require('../../config/discord').getGuild()
const guilds = require('../../config/discord').getGuilds()

const findDiscordUser = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
    } catch (e) { return }
    return guild.member(id) || undefined
}

const findDiscordUserInServers = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
    } catch (e) { return }

    const USER = []
    guilds.forEach(guild => {
        USER.push(guild.member(id) || undefined)
    })
    return USER.filter(Boolean)
}

const inviteDiscordUser = async (id, username) => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
    } catch (e) { return }
    if (await findDiscordUser(id)) return

    const CHANNEL = guild.channels.cache.filter(c => c.type === 'text')
        .sort((a, b) => a.rawPosition - b.rawPosition).first()
    if (!CHANNEL) return

    const INVITE = await CHANNEL.createInvite({
        unique: true,
        maxUses: 1,
        maxAge: 300
    })

    console.log(`User '${username}' created Discord invite: ${INVITE.code}.`)
    return 'https://discord.gg/' + INVITE
}

const kickDiscordUser = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
    } catch (e) { return }

    const USER = await findDiscordUserInServers(id)
    if (!USER || USER.length === 0) return

    const KICK = []
    for (let i = 0; i < USER.length; i++) {
        KICK.push(await USER[i].kick())
    }
    console.log(`User '${USER[0].user.username}#${USER[0].user.discriminator}' has been kicked from server.`)
    return KICK
}

const addDiscordRole = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: [Joi.string().alphanum().required(), Joi.number().required()]
        }).required().validateAsync({ id, role })
    } catch (e) { return }

    const USER = await findDiscordUser(id)
    const ROLE = USER ? await findRole(role) : undefined
    if (!ROLE?.['discord_id']) return

    return USER.roles.add(ROLE.discord_id)
}

const addDiscordRoleByName = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: Joi.string().alphanum().required()
        }).required().validateAsync({ id, role })
    } catch (e) { return }

    const USER = await findDiscordUser(id)
    const ROLE = USER ? await findRoleByName(role) : undefined
    if (!ROLE?.['discord_id']) return

    return USER.roles.add(ROLE.discord_id)
}

const deleteDiscordRole = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: [Joi.string().alphanum().required(), Joi.number().required()]
        }).required().validateAsync({ id, role })
    } catch (e) { return }

    const USER = await findDiscordUser(id)
    const ROLE = USER ? await findRole(role) : undefined
    if (!ROLE?.['discord_id']) return

    return USER.roles.remove(ROLE.discord_id)
}

const deleteDiscordRoleByName = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: Joi.string().alphanum().required()
        }).required().validateAsync({ id, role })
    } catch (e) { return }

    const USER = await findDiscordUser(id)
    const ROLE = USER ? await findRoleByName(role) : undefined
    if (!ROLE?.['discord_id']) return

    return await USER.roles.remove(ROLE.discord_id)
}

const sendDiscordMessage = async (channel, msg) => {
    try {
        await Joi.object().keys({
            channel: [Joi.string().alphanum().required(), Joi.number().required()],
            msg: Joi.string().required()
        }).required().validateAsync({ channel, msg })
    } catch (e) { return }

    const CHANNEL = guild.channels.cache.get(channel)
    if (!CHANNEL) return

    return CHANNEL.send(msg)
}

const sendLogMessage = async msg => {
    try {
        await Joi.string().required().validateAsync(msg)
    } catch (e) { return }

    const CHANNEL = guild.channels.cache.get(process.env.DISCORD_LOGGER_CHANNEL)
    if (!CHANNEL) return

    return CHANNEL.send(msg)
}

const sendSupportMessage = async ({ username, email, text }) => {
    try {
        await Joi.object().keys({
            username: Joi.string().required(),
            email: Joi.string().email(),
            text: Joi.string().required()
        }).required().validateAsync({ username, email, text })
    } catch (e) { return }

    const embed = {
        color: 16748288,
        author: { name: 'Discord username: ' + username },
        fields: [{
            name: 'Text',
            value: text
        }]
    }
    if (email) embed.fields.unshift({ name: 'Email', value: email })

    const CHANNEL = guild.channels.cache.get(process.env.DISCORD_SUPPORT_CHANNEL)
    if (!CHANNEL) return

    return CHANNEL.send({ embed })
}

module.exports = {
    findDiscordUser,
    findDiscordUserInServers,
    inviteDiscordUser,
    kickDiscordUser,
    addDiscordRole,
    addDiscordRoleByName,
    deleteDiscordRole,
    deleteDiscordRoleByName,
    sendDiscordMessage,
    sendLogMessage,
    sendSupportMessage
}
