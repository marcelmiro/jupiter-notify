'use strict'
const Joi = require('joi')
const { findUser } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')
const { listCurrenciesFromRoleId } = require('../../database/repositories/plans')
const { checkPermission } = require('../permissions')
const { findCustomer, findInvoice, findNextInvoice } = require('../stripe')
const { findDiscordUser } = require('../discord/utils')

module.exports = async (socket, userId) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'members', 'r')) {
            return socket.emit('send-error', 'You don\'t have permission to retrieve a member\'s data.')
        }

        try {
            await Joi.string().alphanum().required().validateAsync(userId)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        const [user, userRole] = await Promise.all([
            findUser(userId),
            findRoleFromUserRole(userId)
        ])
        if (!user) return socket.emit('send-error', 'User id doesn\'t exist in database.')
        if (!userRole) return socket.emit('send-error', 'User doesn\'t have a role.')

        const customer = await findCustomer(user.stripe_id)
        if (!customer) socket.emit('send-error', `Customer '${user.stripe_id}' not found.`)
        const subscription = customer?.subscriptions.data[0]

        const member = {
            userId,
            username: user.username,
            avatarUrl: user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048',
            email: user.email,
            stripeId: user.stripe_id,
            dateCreated: parseInt(userRole.created) || parseInt(user.created) || undefined,
            inServer: Boolean(await findDiscordUser(userId)),
            role: {
                name: userRole.name,
                color: userRole.color || undefined
            },
            subscription: { lastInvoice: {} }
        }

        if (subscription) {
            member.subscription = {
                id: subscription.id,
                cancelled: subscription.cancel_at_period_end,
                status: subscription.cancel_at_period_end ? 'canceling' : subscription.status,
                currency: customer.currency,
                currencies: await listCurrenciesFromRoleId(userRole.role_id),
                hasDefaultPayment: Boolean(
                    customer.invoice_settings?.default_payment_method ||
                    subscription.default_payment_method
                )
            }

            const [lastInvoice, nextInvoice] = await Promise.all([
                findInvoice(subscription.latest_invoice),
                findNextInvoice(user.stripe_id)
            ])

            if (lastInvoice) {
                member.subscription.lastInvoice = {
                    id: lastInvoice.id,
                    status: lastInvoice.status,
                    date: parseInt(lastInvoice.created) * 1000
                }
            }
            if (nextInvoice) member.subscription.nextInvoiceDate = parseInt(nextInvoice.created) * 1000
        }

        socket.emit('set-member', member)
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
