'use strict'
const Joi = require('@hapi/joi')
const { findSetting, updateSetting } = require('../../database/repositories/settings')
const { getRelease } = require('../../services/releases')

module.exports = async ({ io, socket, name, value }) => {
    try {
        if (!socket.request.role?.['edit_config']) return socket.emit('send-error', 'You don\'t have permission to update settings.')

        await Joi.object().keys({
            name: Joi.string().required(),
            value: Joi.string().required()
        }).required().validateAsync({ name, value })

        if (!(await findSetting(name))) return socket.emit('send-error', 'Setting name doesn\'t exist.')
        if (value === process.env[name]) return socket.emit('send-error', 'Setting already has the same value.')
        if (name.toLowerCase() === 'in_stock' && await getRelease()) return socket.emit('send-error', 'A release is running therefore you can\'t update this setting.')

        if (await updateSetting(name, value)) {
            console.log(`User '${socket.request.user.username}' has updated '${name}' setting.`)
            socket.emit('send-message', 'Setting value updated.')
            io.sockets.emit('get-settings')
        } else socket.emit('send-error', 'Couldn\'t update setting.')
    } catch (e) {
        console.error('Socket \'update-setting\': ' + e.message)
        socket.emit('send-error', 'Error in socket \'update-setting\'.')
    }
}
