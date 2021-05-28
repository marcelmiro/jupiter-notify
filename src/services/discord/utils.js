'use strict'
const Joi = require('joi')
const fetch = require('node-fetch')
const { findRole, findRoleByName } = require('../../database/repositories/roles')
const { client, getGuild } = require('../../config/discord')
const guild = getGuild()

const findDiscordMember = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
        return await guild.members.fetch(id)
    } catch (e) { return undefined }
}

const findDiscordUser = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
        return await client.users.fetch(id)
    } catch (e) { return undefined }
}

const inviteDiscordUser = async (id, username) => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
    } catch (e) { return }
    if (await findDiscordMember(id)) return

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

const kickDiscordUser = async (id, username) => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
    } catch (e) { return console.error(e) }

    const USER = await findDiscordMember(id)
    if (!USER) return console.debug(`kickDiscordUser(): User '${username}' (${id}) not found.`)

    const KICK = await USER.kick()
    if (!KICK) return console.error(`Discord bot couldn't kick user '${username}' (${id}).`)
    console.log(`User '${username}' (${id}) has been kicked from server.`)
    return KICK
}

const addDiscordRole = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: [Joi.string().alphanum().required(), Joi.number().required()]
        }).validateAsync({ id, role })
    } catch (e) { return console.error(e) }

    const USER = await findDiscordMember(id)
    const ROLE = USER ? await findRole(role) : undefined
    if (!ROLE?.discord_id) return

    return USER.roles.add(ROLE.discord_id)
}

const addDiscordRoleByName = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: Joi.string().alphanum().required()
        }).validateAsync({ id, role })
    } catch (e) { return console.error(e) }

    const USER = await findDiscordMember(id)
    const ROLE = USER ? await findRoleByName(role) : undefined
    if (!ROLE?.discord_id) return

    return USER.roles.add(ROLE.discord_id)
}

const deleteDiscordRole = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: [Joi.string().alphanum().required(), Joi.number().required()]
        }).validateAsync({ id, role })
    } catch (e) { return console.error(e) }

    const USER = await findDiscordMember(id)
    if (!USER) return console.error(`deleteDiscordRole(): User '${id}' not found.`)
    const ROLE = await findRole(role)
    if (!ROLE?.discord_id) return console.error(`deleteDiscordRole(): Role '${role}' doesn't have a discord id in db.`)

    return await USER.roles.remove(ROLE.discord_id)
}

const deleteDiscordRoleByName = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: Joi.string().alphanum().required()
        }).validateAsync({ id, role })
    } catch (e) { return }

    const USER = await findDiscordMember(id)
    if (!USER) return console.error(`deleteDiscordRoleByName(): User '${id}' not found.`)
    const ROLE = await findRoleByName(role)
    if (!ROLE?.discord_id) return console.error(`deleteDiscordRoleByName(): Role '${role}' doesn't have a discord id in db.`)

    return await USER.roles.remove(ROLE.discord_id)
}

const sendDiscordMessage = async (channel, msg) => {
    try {
        await Joi.object().keys({
            channel: [Joi.string().alphanum().required(), Joi.number().required()],
            msg: Joi.string().required()
        }).validateAsync({ channel, msg })
    } catch (e) { return }

    const CHANNEL = guild.channels.cache.get(channel)
    if (!CHANNEL) return

    return CHANNEL.send(msg)
}

const sendLogMessage = async (type, message) => {
    try {
        await Joi.object().keys({
            type: Joi.string().trim().required(),
            message: Joi.string().trim().required()
        }).validateAsync({ type, message })
    } catch (e) { return }

    const webhookUrl = process.env.DISCORD_LOGGER_WEBHOOK
    if (!webhookUrl) return

    type = type.toLowerCase()
    let color
    if (['info', 'log'].includes(type)) color = 4177727
    else if (type === 'error') color = 16711680

    const discordMessage = {
        content: type === 'error' ? '@everyone' : undefined,
        embeds: [{
            color,
            title: 'Website ' + type[0].toUpperCase() + type.slice(1),
            description: message,
            footer: { text: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }) }
        }]
    }

    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(discordMessage)
    })

    return discordMessage
}

const sendSupportMessage = async ({ username, email, text }) => {
    try {
        await Joi.object().keys({
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            text: Joi.string().required()
        }).validateAsync({ username, email, text })
    } catch (e) { return }

    const embed = {
        color: 16748288,
        author: { name: 'Username: ' + username },
        fields: [
            { name: 'Email', value: email },
            { name: 'Text', value: text }
        ],
        footer: { text: new Date().toISOString() }
    }

    const CHANNEL = guild.channels.cache.get(process.env.DISCORD_SUPPORT_CHANNEL)
    if (!CHANNEL) return

    return CHANNEL.send({ embed })
}

module.exports = {
    findDiscordMember,
    findDiscordUser,
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
