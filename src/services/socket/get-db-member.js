'use strict'
const Joi = require('joi')
const { findUser, findUserByUsername, findUserByStripe, findUserByEmail } = require('../../database/repositories/users')
const { checkPermission } = require('../permissions')

module.exports = async (socket, value) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'members', 'r')) {
            return socket.emit('send-error', 'You don\'t have permission to retrieve a member\'s data.')
        }

        try {
            await Joi.string().trim().required().validateAsync(value)
        } catch (e) { return socket.emit('send-error', 'Parameter validation failed: ' + e.message) }

        value = value.trim()

        let user
        try { user = await findUser(value) } catch (e) {}
        if (!user) {
            try { user = await findUserByUsername(value) } catch (e) {}
        } if (!user) {
            try { user = await findUserByStripe(value) } catch (e) {}
        } if (!user) {
            try { user = await findUserByEmail(value) } catch (e) {}
        }

        if (!user) return socket.emit('send-error', 'Couldn\'t find user in database.')

        socket.emit('set-db-member', {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            stripeId: user.stripe_id
        })
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
