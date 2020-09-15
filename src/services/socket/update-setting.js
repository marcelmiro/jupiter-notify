'use strict'
const Joi = require('joi')
const { findSetting, updateSetting } = require('../../database/repositories/settings')
const { getRelease } = require('../releases')

module.exports = async ({ io, socket, name, value }) => {
    try {
        if (!socket.request.role?.edit_config) return socket.emit('send-error', 'You don\'t have permission to update website\'s settings.')

        try {
            await Joi.object().keys({
                name: Joi.string().required(),
                value: Joi.string().required()
            }).required().validateAsync({ name, value })
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        if (!(await findSetting(name))) return socket.emit('send-error', 'Setting name doesn\'t exist.')
        if (value === process.env[name]) return socket.emit('send-error', 'Setting already has the same value.')
        if (name.toLowerCase() === 'in_stock' && (await getRelease())?.stock) return socket.emit('send-error', 'A release is running therefore you can\'t update this setting.')

        if (await updateSetting(name, value)) {
            console.log(`User '${socket.request.user.username}' has updated '${name}' setting.`)
            socket.emit('send-message', 'Setting value updated.')
        } else socket.emit('send-error', 'Couldn\'t update setting.')
        io.sockets.emit('get-settings')
    } catch (e) {
        console.error(e)
    }
}
