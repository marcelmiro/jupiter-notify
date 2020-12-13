'use strict'
const { findAccessToken, insertAccessToken, deleteAccessToken } = require('../../../database/repositories/access_tokens')
const { deleteSoftwareInstances } = require('../../../database/repositories/software_instances')

const TOKEN_CREATED = token => {
    return {
        color: 16748288,
        title: 'Your key has been resetted.',
        description: "Please don't share this key with anyone.",
        fields: [{
            name: 'Key:',
            value: token
        }],
        footer: {
            icon_url: 'https://www.jupiternotify.com/assets/logo.png',
            text: 'Jupiter Notify'
        }
    }
}

const TOKEN_TIMEOUT = time => {
    let timeText

    if (time <= 60) {
        timeText = time === 1
            ? '1 second'
            : time + ' seconds'
    } else {
        time = Math.round(time / 60)
        timeText = time === 1
            ? '1 minute'
            : time + ' minutes'
    }

    return {
        color: 16748288,
        title: 'Sorry but your key is already pretty new.',
        description: `You will be able to generate a new one in ${timeText}.`,
        footer: {
            icon_url: 'https://www.jupiternotify.com/assets/logo.png',
            text: 'Jupiter Notify'
        }
    }
}

const TOKEN_UNEXISTS = {
    color: 16748288,
    title: 'No key was found bound to your account.',
    description: 'Type `!generate` to create one.',
    footer: {
        icon_url: 'https://www.jupiternotify.com/assets/logo.png',
        text: 'Jupiter Notify'
    }
}

const UNEXPECTED_ERROR = {
    color: 16748288,
    title: 'An unexpected error occurred.',
    description: 'Please message a member of staff if this message continues showing up.',
    footer: {
        icon_url: 'https://www.jupiternotify.com/assets/logo.png',
        text: 'Jupiter Notify'
    }
}

module.exports = async message => {
    let embed

    const ACCESS_TOKEN = await findAccessToken(message.author.id)
    if (!ACCESS_TOKEN) embed = TOKEN_UNEXISTS
    else {
        const ACCESS_TOKEN_TIMEOUT = parseInt(process.env.ACCESS_TOKEN_TIMEOUT)
        const ACCESS_TOKEN_DATE = parseInt(ACCESS_TOKEN.created)
            ? Math.round((new Date().getTime() - (new Date(parseInt(ACCESS_TOKEN.created)))) / 1000)
            : undefined

        if (ACCESS_TOKEN_TIMEOUT > ACCESS_TOKEN_DATE) {
            embed = TOKEN_TIMEOUT(ACCESS_TOKEN_TIMEOUT - ACCESS_TOKEN_DATE)
        } else if (
            await deleteSoftwareInstances(ACCESS_TOKEN.access_token) &&
            await deleteAccessToken(message.author.id)
        ) {
            if (!await insertAccessToken(message.author.id)) embed = UNEXPECTED_ERROR
            const accessTokenObject = await findAccessToken(message.author.id)

            embed = accessTokenObject?.access_token
                ? TOKEN_CREATED(accessTokenObject.access_token)
                : UNEXPECTED_ERROR
        } else embed = UNEXPECTED_ERROR
    }

    return await message.author.send({ embed })
}
