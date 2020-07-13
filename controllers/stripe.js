'use strict'
const Joi = require('@hapi/joi')
const { findUser, findUserByStripe } = require('../database/repositories/users')
const { findUserRole, findRoleFromUserRole, insertUserRole, deleteUserRole } = require('../database/repositories/user-roles')
const { findRoleByName } = require('../database/repositories/roles')
const {
    customers: { findCustomer, updateCustomer },
    subscriptions: { updateSubscription, deleteSubscription, transferSubscription },
    paymentMethods: { attachPaymentMethod },
    sessions: { createSubscriptionSession, createEditPaymentSession },
    setupIntents: { findSetupIntent },
    webhook: { createWebhook }
} = require('../services/stripe')
const { kickDiscordUser } = require('../services/discord/utils')
const { getRelease, deleteRelease, useRelease } = require('../services/releases')
const { inStock } = require('../utils')

const pay = async (req, res) => {
    try {
        if (!req.user || !(await inStock())) return res.redirect('/')
        if ((await getRelease())?.releaseStock <= 0) { await deleteRelease(); return res.redirect('/') }
        if (await findUserRole(req.user.user_id)) return res.redirect('/dashboard')

        const CUSTOMER = await findCustomer(req.user.stripe_id)
        if (!CUSTOMER) return res.redirect('/auth/logout')
        if (CUSTOMER.subscriptions.data[0]) return res.redirect('/dashboard')

        const CURRENCY = req.url.includes('?currency=')
            ? req.url.substr(req.url.indexOf('?currency=') + '?currency='.length)
            : undefined
        const SESSION = await createSubscriptionSession(req.user.stripe_id, CURRENCY)

        if (SESSION) {
            res.send(`
                <script src="https://js.stripe.com/v3/"></script>
                <script type="text/javascript">
                    const stripe = Stripe('${process.env.STRIPE_KEY}')
                    stripe.redirectToCheckout({ sessionId: '${SESSION.id}' })
                        .then(r => { if (r.error.message) console.error(r.error.message) })
                        .catch(e => console.error('Error when redirecting to pay membership: ' + e.message))
                </script>
            `)
        } else res.redirect('/')
    } catch (e) {
        console.error('Route \'/stripe/pay\': ' + e.message)
        res.redirect('/')
    }
}

const success = async (req, res) => {
    try {
        res.render('response', { status: 'payment-success' })
    } catch (e) {
        console.error('Route \'/stripe/success\': ' + e.message)
        res.redirect('/')
    }
}

const fail = async (req, res) => {
    try {
        res.render('response', { status: 'payment-fail' })
    } catch (e) {
        console.error('Route \'/stripe/fail\': ' + e.message)
        res.redirect('/')
    }
}

const updatePayment = async (req, res) => {
    try {
        const CUSTOMER = req.user ? await findCustomer(req.user.stripe_id) : undefined
        if (!CUSTOMER?.subscriptions.data[0]) return res.redirect('/dashboard')

        const SESSION = await createEditPaymentSession(CUSTOMER.id)
        if (SESSION) {
            res.send(`
                <script src="https://js.stripe.com/v3/"></script>
                <script type="text/javascript">
                    const stripe = Stripe('${process.env.STRIPE_KEY}')
                    stripe.redirectToCheckout({ sessionId: '${SESSION.id}' })
                        .then(r => { if (r.error.message) console.error(r.error.message) })
                        .catch(e => console.error('Error when redirecting to update subscription payment: ' + e.message))
                </script>
            `)
        } else res.redirect('/dashboard')
    } catch (e) {
        console.error('Route \'/stripe/update-payment\': ' + e.message)
        res.redirect('/dashboard')
    }
}

const cancelMembership = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/')
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE) return res.redirect('/')

        let response
        if (ROLE.name.toLowerCase() === 'renewal') {
            const CUSTOMER = await findCustomer(req.user.stripe_id)
            if (!CUSTOMER) return res.redirect('/auth/logout')
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
            if (!SUBSCRIPTION || SUBSCRIPTION.cancel_at_period_end) return res.redirect('/dashboard')

            response = await updateSubscription(SUBSCRIPTION.id,
                { proration_behavior: 'none', cancel_at_period_end: true })
        } else {
            response = await deleteUserRole(req.user.user_id)
            if (response) await kickDiscordUser(req.user.user_id)
        }

        if (response) console.log(`User '${req.user.username}' has cancelled its membership.`)
        else console.error('Route \'/stripe/cancel-membership\': An unexpected error occurred.')
        if (ROLE.name.toLowerCase() === 'renewal') res.redirect('/dashboard')
        else res.render('response', { status: 'cancel-role' })
    } catch (e) {
        console.error('Route \'/stripe/cancel-membership\': ' + e.message)
        res.redirect('/dashboard')
    }
}

const renewMembership = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/')
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE) return res.redirect('/')
        if (ROLE.name.toLowerCase() !== 'renewal') return res.redirect('/dashboard')

        const CUSTOMER = await findCustomer(req.user.stripe_id)
        if (!CUSTOMER) return res.redirect('/auth/logout')
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
        if (!SUBSCRIPTION?.['cancel_at_period_end']) return res.redirect('/dashboard')

        const RESPONSE = await updateSubscription(SUBSCRIPTION.id, { cancel_at_period_end: false })

        if (RESPONSE) console.log(`User '${req.user.username}' has renewed its membership.`)
        else console.error('Route \'/stripe/renew-membership\': An unexpected error occurred.')
        res.redirect('/dashboard')
    } catch (e) {
        console.error('Route \'/stripe/renew-membership\': ' + e.message)
        res.redirect('/dashboard')
    }
}

const transferMembership = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/')
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE) return res.redirect('/')
        if (!['renewal', 'lifetime'].includes(ROLE.name.toLowerCase())) return res.render('response', { status: 'transfer-staff' })

        const PATH = '/transfer-membership?'
        const USER_ID = req.url.includes(PATH)
            ? req.url.substr(req.url.indexOf(PATH) + PATH.length)
            : undefined
        await Joi.number().required().validateAsync(USER_ID)

        const USER = await findUser(USER_ID)
        if (!USER || await findUserRole(USER_ID)) return res.render('response', { status: 'transfer-fail' })

        if (ROLE.name.toLowerCase() === 'renewal') {
            const CUSTOMER = await findCustomer(req.user.stripe_id)
            const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
            if (!SUBSCRIPTION) return res.render('response', { status: 'transfer-fail' })

            if (await transferSubscription({
                customerId: USER.stripe_id,
                date: SUBSCRIPTION.current_period_end,
                currency: CUSTOMER.currency
            })) await deleteSubscription(SUBSCRIPTION.id)
            else return res.render('response', { status: 'transfer-fail' })
        }

        if (await insertUserRole(USER_ID, ROLE.role_id)) {
            await deleteUserRole(req.user.user_id)
            console.log(`User '${req.user.username}' transferred its '${ROLE.name}' license to '${USER.username}'.`)
            res.render('response', { status: 'transfer-success' })
        } else {
            console.error('Route \'/stripe/transfer-membership\': An unexpected error occurred.')
            res.render('response', { status: 'transfer-fail' })
        }
    } catch (e) {
        console.error('Route \'/stripe/transfer-membership\': ' + e.message)
        res.redirect('/dashboard')
    }
}

const webhook = async (req, res) => {
    try {
        const EVENT = await createWebhook(req.body, req.headers['stripe-signature'])
        const SESSION = EVENT?.data?.object
        if (!SESSION) return res.json({ received: false })
        const USER = SESSION.customer ? await findUserByStripe(SESSION.customer) : undefined
        if (!USER) return res.json({ received: false })

        if (EVENT.type === 'checkout.session.completed') {
            let defaultPayment
            const CUSTOMER = await findCustomer(USER.stripe_id)
            const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
            if (!SUBSCRIPTION) return

            if (SESSION.mode === 'subscription') {
                defaultPayment = SUBSCRIPTION.default_payment_method
                await useRelease()

                if (!(await findUserRole(USER.user_id))) {
                    const RENEWAL_ROLE = await findRoleByName('renewal')
                    if (RENEWAL_ROLE) await insertUserRole(USER.user_id, RENEWAL_ROLE.id)
                }

                console.log(`User '${USER.username}' has bought a subscription.`)
            } else if (SESSION.mode === 'setup') {
                if (SUBSCRIPTION.cancel_at_period_end) {
                    await updateSubscription(SUBSCRIPTION.id, { cancel_at_period_end: false })
                }

                const SETUP_INTENT = await findSetupIntent(SESSION.setup_intent)
                if (!SETUP_INTENT) return
                const PAYMENT_METHOD = await attachPaymentMethod(CUSTOMER.id, SETUP_INTENT.payment_method)
                if (!PAYMENT_METHOD) return
                defaultPayment = PAYMENT_METHOD.id
            }

            await updateCustomer(CUSTOMER.id, { invoice_settings: { default_payment_method: defaultPayment } })
            await updateSubscription(SUBSCRIPTION.id, { default_payment_method: defaultPayment })
        } else if (EVENT.type === 'customer.subscription.deleted') {
            await deleteUserRole(USER.user_id)
            await kickDiscordUser(USER.user_id)
            console.log(`User '${USER.username}'s membership has been deleted.`)
        }

        res.json({ received: true })
    } catch (e) {
        console.error('Route \'/stripe/webhook\': ' + e.message)
        res.status(400).send('Route \'/stripe/webhook\': ' + e.message)
    }
}

module.exports = { pay, success, fail, updatePayment, cancelMembership, renewMembership, transferMembership, webhook }
