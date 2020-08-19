'use strict'
const Joi = require('@hapi/joi')
const guild = require('../../config/discord').getGuild()
const { findRole, findRoleByName } = require('../../database/repositories/roles')

const findDiscordUser = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
        return guild.member(id) || undefined
    } catch (e) {
        return console.error('findDiscordUser(): ' + e.message)
    }
}

const inviteDiscordUser = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
        if (await findDiscordUser(id)) return

        const CHANNEL = guild.channels.cache.filter(c => c.type === 'text')
            .sort((a, b) => a.rawPosition - b.rawPosition).first()
        const INVITE = await CHANNEL.createInvite({
            unique: true,
            maxUses: 1,
            maxAge: 300
        })

        console.log('Created Discord invite: ' + INVITE.code)
        return 'https://discord.gg/' + INVITE
    } catch (e) {
        return console.error('inviteDiscordUser(): ' + e.message)
    }
}

const kickDiscordUser = async id => {
    try {
        await Joi.string().alphanum().required().validateAsync(id)
        const USER = await findDiscordUser(id)
        if (!USER) return

        const KICK = await USER.kick()
        console.log(`User '${USER.user.username}#${USER.user.discriminator}' has been kicked from server.`)
        return KICK
    } catch (e) {
        return console.error('kickDiscordUser(): ' + e.message)
    }
}

const addDiscordRole = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: [Joi.string().alphanum().required(), Joi.number().required()]
        }).required().validateAsync({ id, role })

        const USER = await findDiscordUser(id)
        const ROLE = await findRole(role)
        if (!USER || !ROLE?.['discord_id']) return

        return await USER.roles.add(ROLE.discord_id)
    } catch (e) {
        return console.error('addDiscordRole(): ' + e.message)
    }
}

const addDiscordRoleByName = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: Joi.string().alphanum().required()
        }).required().validateAsync({ id, role })

        const USER = await findDiscordUser(id)
        if (!USER) return console.error('addDiscordRoleByName(): User id not found in server.')
        const ROLE = await findRoleByName(role)
        if (!ROLE) return console.error('addDiscordRoleByName(): Role not found in database.')
        if (!ROLE.discord_id) return console.error('addDiscordRoleByName(): Role\'s Discord id not found.')

        return await USER.roles.add(ROLE.discord_id)
    } catch (e) {
        return console.error('addDiscordRoleByName(): ' + e.message)
    }
}

const deleteDiscordRole = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: [Joi.string().alphanum().required(), Joi.number().required()]
        }).required().validateAsync({ id, role })

        const USER = await findDiscordUser(id)
        if (!USER) return console.error('deleteDiscordRole(): User id not found in server.')
        const ROLE = await findRole(role)
        if (!ROLE) return console.error('deleteDiscordRole(): Role not found in database.')
        if (!ROLE.discord_id) return console.error('deleteDiscordRole(): Role\'s Discord id not found.')

        return await USER.roles.remove(ROLE.discord_id)
    } catch (e) {
        return console.error('deleteDiscordRole(): ' + e.message)
    }
}

const deleteDiscordRoleByName = async (id, role) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            role: Joi.string().alphanum().required()
        }).required().validateAsync({ id, role })

        const USER = await findDiscordUser(id)
        if (!USER) return console.error('deleteDiscordRoleByName(): User id not found in server.')
        const ROLE = await findRoleByName(role)
        if (!ROLE) return console.error('deleteDiscordRoleByName(): Role not found in database.')
        if (!ROLE.discord_id) return console.error('deleteDiscordRoleByName(): Role\'s Discord id not found.')

        return await USER.roles.remove(ROLE.discord_id)
    } catch (e) {
        return console.error('deleteDiscordRoleByName(): ' + e.message)
    }
}

const sendDiscordMessage = async (channel, msg) => {
    try {
        await Joi.object().keys({
            channel: [Joi.string().alphanum().required(), Joi.number().required()],
            msg: Joi.string().required()
        }).required().validateAsync({ channel, msg })

        const CHANNEL = guild.channels.cache.get('channel')
        if (!CHANNEL) return console.error('sendDiscordMessage(): Channel name not found in server.')

        return CHANNEL.send(msg)
    } catch (e) {
        return console.error('sendDiscordMessage(): ' + e.message)
    }
}

const sendLogMessage = async msg => {
    try {
        await Joi.string().required().validateAsync(msg)
        return guild.channels.cache.get(process.env.DISCORD_LOGGER_CHANNEL).send(msg)
    } catch (e) {
        console.error('sendLogMessage(): ' + e.message)
        process.exit(1)
    }
}

const sendSupportMessage = async ({ id, name, text }) => {
    try {
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            name: Joi.string().required(),
            text: Joi.string().required()
        }).required().validateAsync({ id, name, text })

        const EMBED = {
            color: 16748288,
            author: { name: 'Name: ' + name },
            title: 'Discord id: ' + id,
            fields: [{
                name: 'Text',
                value: text
            }]
        }
        return guild.channels.cache.get(process.env.DISCORD_SUPPORT_CHANNEL).send({ embed: EMBED })
    } catch (e) {
        return console.error('sendSupportMessage(): ' + e.message)
    }
}

module.exports = {
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
