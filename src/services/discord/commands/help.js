'use strict'

const embed = {
    color: 16748288,
    fields: [
        {
            name: 'Generate a key:',
            value: '`!generate`'
        },
        {
            name: 'Re-generate a brand new key:',
            value: '`!reset`'
        },
        {
            name: 'Log out from our software:',
            value: '`!logout`'
        },
        {
            name: 'Retrieve your key:',
            value: '`!get`'
        }
    ],
    footer: {
        icon_url: 'https://www.jupiternotify.com/assets/logo.png',
        text: 'Jupiter Notify'
    }
}

module.exports = async message => {
    return await message.author.send({ embed })
}
