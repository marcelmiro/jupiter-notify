'use strict'
const { findUser } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')
const { findCustomer, findInvoice, findNextInvoice } = require('../stripe')
const { findDiscordUser } = require('../discord/utils')
const { transformDate } = require('../../utils')

module.exports = async ({ socket, userId }) => {
    try {
        if (!socket.request.role?.view_members) {
            socket.emit('close-member-view')
            return socket.emit('send-error', 'You don\'t have permission to retrieve a member\'s data.')
        }

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
                stripeId: USER.stripe_id,
                cookieId: USER.cookie_id,
                dateCreated: parseInt(USER.created)
                    ? await transformDate(new Date(parseInt(USER.created)))
                    : 'undefined',
                inServer: Boolean(await findDiscordUser(userId))
            },
            role: { name: ROLE.name, color: ROLE.color }
        }

        if (SUBSCRIPTION) {
            DATA.subscription = {
                id: SUBSCRIPTION.id,
                status: SUBSCRIPTION.cancel_at_period_end ? 'cancelled' : SUBSCRIPTION.status,
                hasDefaultPayment: Boolean(CUSTOMER.invoice_settings?.default_payment_method)
            }

            const LAST_INVOICE = SUBSCRIPTION.latest_invoice
                ? await findInvoice(SUBSCRIPTION.latest_invoice)
                : undefined
            if (LAST_INVOICE) {
                DATA.subscription.lastInvoice = {
                    id: LAST_INVOICE.id,
                    status: LAST_INVOICE.status,
                    date: await transformDate(new Date(LAST_INVOICE.created * 1000))
                }
            }

            const NEXT_INVOICE = await findNextInvoice(USER.stripe_id)
            if (NEXT_INVOICE?.subscription === SUBSCRIPTION.id) {
                DATA.subscription.nextInvoice = {
                    status: NEXT_INVOICE.status,
                    date: await transformDate(new Date(NEXT_INVOICE.created * 1000))
                }
            }
        }

        socket.emit('set-member-view', DATA)
    } catch (e) {
        console.error(e)
    }
}
