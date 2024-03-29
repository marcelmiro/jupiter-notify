'use strict'
const { updateUser } = require('../database/repositories/users')
const { listRoles, findRole } = require('../database/repositories/roles')
const { findUserRole, findRoleFromUserRole, insertUserRole } = require('../database/repositories/user-roles')
const { listRoleIdsFromPlans, findPlan, findPlanByRoleAndCurrency } = require('../database/repositories/plans')
const { deleteUser } = require('../services/users')
const { findCustomer, findPaymentMethod } = require('../services/stripe')
const { findDiscordMember, findDiscordUser, inviteDiscordUser, addDiscordRole } = require('../services/discord/utils')
const { inStock, transformDate, getCurrencySymbol } = require('../utils')

const index = async (req, res) => {
    try {
        const ROLE = req.user ? await findRoleFromUserRole(req.user.user_id) : undefined
        let stock = await inStock()
        if (stock && process.env.PASSWORD && process.env.PASSWORD !== req.query.password) {
            stock = false
        }

        res.render('index', {
            isUser: Boolean(req.user),
            inStock: stock,
            hasRole: Boolean(ROLE),
            isAdmin: Boolean(ROLE?.admin_panel),
            loginFail: Boolean('login_fail' in req.query),
            waitingRoomLink: process.env.WAITING_ROOM_LINK
        })
    } catch (e) {
        console.error(e)
    }
}

const dashboard = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const CUSTOMER = await findCustomer(req.user.stripe_id)
        if (!CUSTOMER) return res.redirect('/logout')
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
        const PLAN_ROLES = await listRoleIdsFromPlans()

        let ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE) {
            if (!SUBSCRIPTION) return res.redirect('/')

            const PLAN_ID = SUBSCRIPTION.items.data[0]?.price.id
            const PLAN = await findPlan(PLAN_ID)
            ROLE = PLAN?.role_id ? await findRole(PLAN.role_id) : undefined

            if (ROLE) {
                if (await insertUserRole(req.user.user_id, ROLE.role_id)) {
                    await addDiscordRole(req.user.user_id, ROLE.role_id)
                } else return res.redirect('/')
            } else return res.redirect('/')
        } else if (!SUBSCRIPTION && PLAN_ROLES?.includes(ROLE.role_id)) {
            await deleteUser(req.user.user_id)
            return res.redirect('/')
        }

        const [discordUser, discordMember] = await Promise.all([
            findDiscordUser(req.user.user_id),
            findDiscordMember(req.user.user_id)
        ])

        const avatarUrl = discordUser?.avatar
            ? `https://cdn.discordapp.com/avatars/${req.user.user_id}/${discordUser.avatar}`
            : req.user.avatar_url

        if (avatarUrl !== req.user.avatar_url) {
            await updateUser(req.user.user_id, 'avatar_url', avatarUrl)
        }

        const user = {
            avatarUrl,
            username: req.user.username,
            inServer: Boolean(discordMember)
        }
        const membershipDetails = {
            subscription: false,
            cancelled: false,
            plan: ROLE.name,
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
            const PLAN = SUBSCRIPTION.items.data[0]?.price

            membershipDetails.subscription = true
            membershipDetails.cancelled = Boolean(SUBSCRIPTION.cancel_at_period_end)
            membershipDetails.price = PLAN
                ? (await getCurrencySymbol(CUSTOMER.currency) || '$') + (Math.round(PLAN.unit_amount) / 100)
                : 'null'
            membershipDetails.dateNextPayment = !SUBSCRIPTION.cancel_at_period_end
                ? await transformDate(new Date(SUBSCRIPTION.current_period_end * 1000))
                : '-'
            membershipDetails.dateCreated = parseInt(SUBSCRIPTION.created)
                ? await transformDate(new Date(SUBSCRIPTION.created * 1000))
                : 'null'

            if (SUBSCRIPTION.default_payment_method) {
                const DEFAULT_PAYMENT = await findPaymentMethod(SUBSCRIPTION.default_payment_method)

                paymentDetails.name = DEFAULT_PAYMENT?.billing_details.name || 'null'
                paymentDetails.last4 = DEFAULT_PAYMENT?.card.last4 || 'null'
                if (DEFAULT_PAYMENT) {
                    let month = DEFAULT_PAYMENT.card.exp_month.toString()
                    month = month.length === 1 ? '0' + month : month
                    let year = DEFAULT_PAYMENT.card.exp_year.toString()
                    year = year.length >= 4 ? year.slice(-2) : year
                    paymentDetails.dateExpiry = month + '/' + year
                } else paymentDetails.dateExpiry = 'null'
            }
        } else {
            membershipDetails.price = 'Lifetime'
            membershipDetails.dateNextPayment = 'Never'
            membershipDetails.dateCreated = parseInt(req.user.created)
                ? await transformDate(new Date(parseInt(req.user.created)))
                : 'null'
            paymentDetails = undefined
        }

        res.render('dashboard', {
            user,
            membershipDetails,
            paymentDetails,
            isAdmin: Boolean(ROLE.admin_panel)
        })
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

const admin = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const role = await findRoleFromUserRole(req.user.user_id)
        if (!role?.admin_panel) return res.redirect('/')

        let roles = await listRoles()
        if (roles) {
            roles.sort((a, b) => {
                if (!a.importance) return 1
                else if (!b.importance) return -1
                else if (a.importance < b.importance) return -1
                else if (a.importance > b.importance) return 1

                if (!a.name) return 1
                else if (!b.name) return -1
                else if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
                else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
                return 0
            })
            roles = roles.map(role => role.name)
        }

        res.render('admin', { role, roles })
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

const join = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        if (!(await findUserRole(req.user.user_id))) return res.redirect('/')

        const INVITE = await inviteDiscordUser(req.user.user_id, req.user.username)
        INVITE ? res.redirect(INVITE) : res.send('<script>window.close();</script>')
    } catch (e) {
        console.error(e)
        res.redirect('/dashboard')
    }
}

const terms = async (req, res) => {
    try {
        res.render('terms')
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

const weeklies = async (req, res) => {
    try {
        if (!process.env.weeklies) return res.render('response', { status: 'oos' })
        if (process.env.weeklies < 1) {
            delete process.env.weelies
            return res.render('response', { status: 'oos' })
        }

        const PLAN = await findPlanByRoleAndCurrency(7, 'weeklyUSD')
        if (!PLAN?.plan_id) return res.redirect('/stripe/fail')

        res.redirect('/stripe/pay?planId=' + PLAN.plan_id)
    } catch (e) {
        console.error(e)
        res.redirect('/stripe/fail')
    }
}

module.exports = { index, dashboard, admin, join, terms, weeklies }
