'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { updateSetting } = require('../../database/repositories/settings')
const { checkPermission } = require('../permissions')

module.exports = async (socket, value) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'restocks', 'u')) {
            return socket.emit('send-error', 'You don\'t have permission to update \'In Stock\' setting.')
        }

        try {
            await Joi.boolean().required().validateAsync(value)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        if (!await updateSetting('IN_STOCK', value.toString())) {
            return socket.emit('send-error', 'Error on updating \'In Stock\' setting.')
        }

        console.log(`User '${socket.request.user.username}' updated 'In Stock' setting to '${value}'.`)
        await emitSocket('get-in-stock')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
