'use strict'
const Joi = require('joi')

module.exports = async ({ io, socket, number }) => {
    try {
        if (!socket.request.role?.create_releases) return socket.emit('send-error', 'You don\'t have permission to set weeklies.')

        try {
            await Joi.number().required().validateAsync(number)
        } catch (e) { return socket.emit('send-error', 'Parameter validation failed: ' + e.message) }

        if (parseInt(number) < 0) return socket.emit('send-error', 'Weeklies number can\'t be negative.')

        process.env.weeklies = number
        console.log(`User '${socket.request.user.username}' set weeklies to ${number}.`)
        socket.emit('send-message', number + ' weeklies set.')
        io.sockets.emit('get-weeklies')
    } catch (e) {
        console.error(e)
    }
}
