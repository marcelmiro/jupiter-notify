'use strict'
const { findUser, updateUser } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')
const { findCustomer } = require('../stripe')
const { findDiscordUser } = require('../discord/utils')

module.exports = async ({ socket, userId }) => {
    try {
        if (!socket.request.role?.view_members) {
            socket.emit('close-member-edit')
            return socket.emit('send-error', 'You don\'t have permission to edit a member\'s data.')
        }

        const USER = await findUser(userId)
        if (!USER) {
            socket.emit('close-member-edit')
            return socket.emit('send-error', 'User id doesn\'t exist in database.')
        }
        const ROLE = await findRoleFromUserRole(userId)
        if (!ROLE) {
            socket.emit('close-member-edit')
            return socket.emit('send-error', 'User doesn\'t have a role.')
        }

        const IMPORTANCE_ADMIN = socket.request.role.importance
        const IMPORTANCE_USER = ROLE.importance || 10
        if ((IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER) || IMPORTANCE_ADMIN > IMPORTANCE_USER) {
            socket.emit('close-member-edit')
            return socket.emit('send-error', `You don't have permission to edit a user with '${ROLE.name}' role.`)
        }

        const CUSTOMER = await findCustomer(USER.stripe_id)
        if (!CUSTOMER) {
            socket.emit('close-member-edit')
            return socket.emit('send-error', 'Couldn\'t find customer.')
        }
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]

        const discordUser = await findDiscordUser(userId)
        const avatarUrl = discordUser?.avatar
            ? `https://cdn.discordapp.com/avatars/${userId}/${discordUser.avatar}`
            : USER.avatar_url

        if (avatarUrl !== USER.avatar_url) {
            await updateUser(userId, 'avatar_url', avatarUrl)
        }

        const DATA = {
            userId,
            username: USER.username,
            avatarUrl: USER.avatar_url,
            stripeId: USER.stripe_id,
            role: ROLE.name
        }

        if (SUBSCRIPTION) {
            DATA.subscription = true
            DATA.subscriptionCurrency = CUSTOMER.currency
            DATA.subscriptionTrial = 0

            if (SUBSCRIPTION.trial_end) {
                const d1 = new Date()
                const d2 = new Date(SUBSCRIPTION.trial_end * 1000)
                DATA.subscriptionTrial = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24))
            }
        }

        socket.emit('set-member-edit', DATA)
    } catch (e) {
        console.error(e)
    }
}
