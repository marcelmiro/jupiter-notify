'use strict'
const { findAccessToken } = require('../../../database/repositories/access_tokens')
const { deleteSoftwareInstances } = require('../../../database/repositories/software_instances')

const TOKEN_LOGOUT = {
    color: 16748288,
    title: 'Your key has been logged out from all of our software.',
    footer: {
        icon_url: 'https://www.jupiternotify.com/assets/logo.png',
        text: 'Jupiter Notify'
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
    else if (await deleteSoftwareInstances(ACCESS_TOKEN.access_token)) embed = TOKEN_LOGOUT
    else embed = UNEXPECTED_ERROR

    return await message.author.send({ embed })
}
