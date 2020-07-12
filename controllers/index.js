'use strict'
const Joi = require('@hapi/joi')
const { findRoleByName } = require('../database/repositories/roles')
const { findUserRole, findRoleFromUserRole, insertUserRole, deleteUserRole } = require('../database/repositories/user-roles')
const { customers: { findCustomer }, paymentMethods: { findPaymentMethod } } = require('../services/stripe')
const { findDiscordUser, inviteDiscordUser, kickDiscordUser, sendSupportMessage } = require('../services/discord/utils')
const { inStock, transformDate } = require('../utils')

const index = async (req, res) => {
    try {
        const ROLE = req.user ? await findRoleFromUserRole(req.user.user_id) : undefined
        res.render('index', {
            inStock: await inStock(),
            isUser: Boolean(req.user),
            hasRole: Boolean(ROLE),
            isAdmin: Boolean(ROLE?.['admin_panel'])
        })
    } catch (e) {
        console.error('Route \'/\': ' + e.message)
    }
}

const dashboard = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/')
        const CUSTOMER = await findCustomer(req.user.stripe_id)
        if (!CUSTOMER) return res.redirect('/auth/logout')
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]

        let ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE) {
            if (!SUBSCRIPTION) return res.redirect('/')
            const RENEWAL_ROLE = await findRoleByName('renewal')
            if (RENEWAL_ROLE?.['role_id']) {
                await insertUserRole(req.user.user_id, RENEWAL_ROLE.role_id)
                ROLE = RENEWAL_ROLE
            } else return res.redirect('/')
        } else if (ROLE.name.toLowerCase() === 'renewal' && !SUBSCRIPTION) {
            await deleteUserRole(req.user.user_id)
            await kickDiscordUser(req.user.user_id)
            return res.redirect('/')
        }

        const USER = {
            username: req.user.username,
            avatarUrl: req.user.avatar_url,
            inServer: Boolean(await findDiscordUser(req.user.user_id))
        }

        const membershipDetails = {
            subscription: false,
            cancelled: false,
            plan: undefined,
            price: undefined,
            dateNextPayment: undefined,
            dateCreated: undefined
        }
        let paymentDetails = {
            name: undefined,
            last4: undefined,
            dateExpiry: undefined
        }

        if (SUBSCRIPTION) {
            membershipDetails.subscription = true
            membershipDetails.cancelled = Boolean(SUBSCRIPTION.cancel_at_period_end)
            membershipDetails.plan = SUBSCRIPTION.plan.interval === 'month'
                ? 'Monthly' : SUBSCRIPTION.plan.interval === 'week'
                    ? 'Weekly' : SUBSCRIPTION.plan.interval === 'day'
                        ? 'Daily' : SUBSCRIPTION.plan.interval
            let price = Math.round(SUBSCRIPTION.plan.amount) / 100
            price = CUSTOMER.currency === 'eur' ? price + '€'
                : CUSTOMER.currency === 'usd' ? '$' + price
                    : CUSTOMER.currency === 'gbp' ? '£' + price : price
            membershipDetails.price = price
            membershipDetails.dateNextPayment = !SUBSCRIPTION.cancel_at_period_end
                ? await transformDate(new Date(SUBSCRIPTION.current_period_end * 1000))
                : '-'
            membershipDetails.dateCreated = await transformDate(new Date(SUBSCRIPTION.created * 1000))

            if (SUBSCRIPTION.default_payment_method) {
                const DEFAULT_PAYMENT = await findPaymentMethod(SUBSCRIPTION.default_payment_method)
                paymentDetails.name = DEFAULT_PAYMENT.billing_details.name
                paymentDetails.last4 = DEFAULT_PAYMENT.card.last4
                let month = DEFAULT_PAYMENT.card.exp_month.toString()
                month = month.length === 1 ? '0' + month : month
                let year = DEFAULT_PAYMENT.card.exp_year.toString()
                year = year.length === 4 ? year.slice(-2) : year
                paymentDetails.dateExpiry = month + '/' + year
            }
        } else if (ROLE.name.toLowerCase() !== 'renewal') {
            membershipDetails.plan = ROLE.name
            membershipDetails.price = 'Lifetime'
            membershipDetails.dateNextPayment = 'Never'
            membershipDetails.dateCreated = parseInt(req.user.date_created)
                ? await transformDate(new Date(parseInt(req.user.date_created)))
                : undefined

            paymentDetails = undefined
        } else return res.redirect('/')

        res.render('dashboard', {
            user: USER,
            isAdmin: Boolean(ROLE?.['admin_panel']),
            paymentDetails,
            membershipDetails
        })
    } catch (e) {
        console.error('Route \'/dashboard\': ' + e.message)
        res.redirect('/')
    }
}

const admin = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/')
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE?.['admin_panel']) return res.redirect('/')

        res.render('admin', { role: ROLE })
    } catch (e) {
        console.error('Route \'/admin\': ' + e.message)
        res.redirect('/')
    }
}

const discordJoin = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/')
        const ROLE = await findUserRole(req.user.user_id)
        if (!ROLE) return res.redirect('/')

        const INVITE = await inviteDiscordUser(req.user.user_id)
        INVITE ? res.redirect(INVITE) : res.send('<script>window.close();</script>')
    } catch (e) {
        console.error('Route \'/discord/join\': ' + e.message)
        res.redirect('/dashboard')
    }
}

const sendSupport = async (req, res) => {
    try {
        const { id, name, text } = req.body
        await Joi.object().keys({
            id: Joi.string().alphanum().required(),
            name: Joi.string().required(),
            text: Joi.string().required()
        }).required().validateAsync({ id, name, text })

        await sendSupportMessage({ id, name, text })
        res.status(200).send('Message successfully sent.')
    } catch (e) {
        res.status(400).send('Route \'/send-support\': ' + e.message)
    }
}

module.exports = { index, dashboard, admin, discordJoin, sendSupport }
