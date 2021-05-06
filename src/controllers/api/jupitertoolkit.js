'use strict'
const Joi = require('joi')
const { validate: uuidValidate } = require('uuid')
const { updateUser } = require('../../database/repositories/users')
const { findUserAndUserRole } = require('../../database/repositories/user-roles')
const { findAccessTokenByToken } = require('../../database/repositories/access_tokens')
const { findSoftwareInstanceByAccessToken, insertSoftwareInstance } = require('../../database/repositories/software_instances')
const { findDiscordUser } = require('../../services/discord/utils')

const softwareId = 'jupitertoolkit'

const authorize = async (req, res) => {
    try {
        const { accessToken, hardwareId } = req.body
        if (!uuidValidate(accessToken)) return res.status(400).send({ message: 'This key format is not supported. Please check if you typed your key correctly.' })
        try {
            await Joi.string().required().validateAsync(hardwareId)
        } catch (e) { return res.status(400).send({ message: 'Login failed. If this problem persists, please contact a staff member from Jupiter Notify.' }) }

        const accessTokenObject = await findAccessTokenByToken(accessToken)
        if (!accessTokenObject?.user_id) return res.status(404).send({ message: 'License key not found. Please check if you typed your key correctly.' })
        const user = await findUserAndUserRole(accessTokenObject.user_id)
        if (!user?.role_id) return res.status(403).send({ message: 'Jupiter Toolkit can only be used by Jupiter Notify members.' })

        const softwareInstance = await findSoftwareInstanceByAccessToken({
            softwareId,
            accessToken
        })

        if (softwareInstance && softwareInstance.instance_id !== hardwareId) {
            return res.status(403).send({ message: 'License key is already bound to another machine. You may logout from the bound machine through our Discord bot.' })
        }

        if (!softwareInstance) {
            await insertSoftwareInstance({
                softwareId,
                accessToken,
                instanceId: hardwareId
            })
        }

        const discordUser = await findDiscordUser(user.user_id)
        let avatarUrl = discordUser?.avatar
            ? `https://cdn.discordapp.com/avatars/${user.user_id}/${discordUser.avatar}`
            : user.avatar_url

        if (avatarUrl !== user.avatar_url) {
            await updateUser(user.user_id, 'avatar_url', avatarUrl)
        }

        avatarUrl = avatarUrl + (avatarUrl.includes('.png') ? '' : '.png') + '?size=256'

        res.status(200).send({
            softwareId,
            accessToken,
            hardwareId,
            avatarUrl,
            userId: user.user_id,
            username: user.username
        })
    } catch (e) {
        console.error(e)
        res.status(500).send({ message: 'Login failed. If this problem persists, please contact a staff member from Jupiter Notify.' })
    }
}

module.exports = { authorize }
