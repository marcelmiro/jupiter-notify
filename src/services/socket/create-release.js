'use strict'
const Joi = require('joi')
const { getRelease, createRelease } = require('../releases')

module.exports = async ({ io, socket, number }) => {
    try {
        if (!socket.request.role?.create_releases) return socket.emit('send-error', 'You don\'t have permission to create releases.')

        try {
            await Joi.number().required().validateAsync(number)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        if ((await getRelease())?.stock) return socket.emit('send-error', 'A release is already running. Stop it if you want to create a new one.')

        if (parseInt(number) < 1) return socket.emit('send-error', 'Amount of licenses released must be greater than 0.')
        if (await createRelease(number)) {
            console.log(`User '${socket.request.user.username}' has released ${number} subscription license${parseInt(number) > 1 ? 's' : ''}.`)
            socket.emit('send-message', 'Stock released.')
            io.sockets.emit('get-release')
        } else socket.emit('send-error', 'Couldn\'t create release.')
    } catch (e) {
        console.error(e)
    }
}
