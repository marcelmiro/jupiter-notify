'use strict'
const { findUser } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')
const { customers: { findCustomer } } = require('../../services/stripe')

module.exports = async ({ socket, userId }) => {
    try {
        if (!socket.request.role?.['view_members']) return socket.emit('send-error', 'You don\'t have permission to edit a member\'s data.')

        const USER = await findUser(userId)
        if (!USER) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        const ROLE = await findRoleFromUserRole(userId)
        if (!ROLE) return socket.emit('send-error', 'User doesn\'t have a role.')
        const CUSTOMER = await findCustomer(USER.stripe_id)
        if (!CUSTOMER) return socket.emit('send-error', 'Couldn\'t find customer.')
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]

        const DATA = {
            user: {
                userId,
                username: USER.username,
                email: USER.email,
                avatarUrl: USER.avatar_url || 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048',
                stripeId: USER.stripe_id
            },
            role: ROLE.name
        }

        if (SUBSCRIPTION) {
            DATA.subscription = {
                id: SUBSCRIPTION.id,
                currency: CUSTOMER.currency,
                trial: 0
            }

            if (SUBSCRIPTION.trial_end) {
                const d1 = new Date()
                const d2 = new Date(SUBSCRIPTION.trial_end * 1000)
                DATA.subscription.trial = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24))
            }
        }

        socket.emit('set-member-edit', DATA)
    } catch (e) {
        console.error('Socket \'get-member-edit\': ' + e.message)
        socket.emit('send-error', 'Error in socket \'get-member-edit\'.')
    }
}
