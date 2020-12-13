'use strict'
const { findAccessToken, insertAccessToken } = require('../../../database/repositories/access_tokens')

const TOKEN_CREATED = token => {
    return {
        color: 16748288,
        title: 'Your key has been generated.',
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

const TOKEN_EXISTS = {
    color: 16748288,
    title: 'You already have a key bound to your account.',
    description: 'Type `!get` to retrieve it.',
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

    if (await findAccessToken(message.author.id)) embed = TOKEN_EXISTS
    else {
        if (!await insertAccessToken(message.author.id)) embed = UNEXPECTED_ERROR
        const accessTokenObject = await findAccessToken(message.author.id)

        embed = accessTokenObject?.access_token
            ? TOKEN_CREATED(accessTokenObject.access_token)
            : UNEXPECTED_ERROR
    }

    return await message.author.send({ embed })
}
