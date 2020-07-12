'use strict'
const Joi = require('@hapi/joi')
const { getRelease, createRelease } = require('../../services/releases')

module.exports = async ({ io, socket, number }) => {
    try {
        if (!socket.request.role?.['create_releases']) return socket.emit('send-error', 'You don\'t have permission to create releases.')

        await Joi.number().required().validateAsync(number)

        if (await getRelease()) return socket.emit('send-error', 'A release is already running. Stop it if you want to create a new one.')

        if (await createRelease(number)) {
            console.log(`User '${socket.request.user.username}' has released ${number} renewal license${parseInt(number) > 1 ? 's' : ''}.`)
            socket.emit('send-message', 'Stock released.')
            io.sockets.emit('get-release')
        } else socket.emit('send-error', 'Couldn\'t create release.')
    } catch (e) {
        console.error('Socket \'create-release\': ' + e.message)
        socket.emit('send-error', 'Error in socket \'create-release\'.')
    }
}
