'use strict'
const Joi = require('joi')
const { findUser, findUserByStripe } = require('../database/repositories/users')
const { findUserRole, findRoleFromUserRole, insertUserRole } = require('../database/repositories/user-roles')
const { findRoleByName } = require('../database/repositories/roles')
const { deleteUser } = require('../services/users')
const {
    findCustomer, updateCustomer, updateSubscription, transferSubscription, attachPaymentMethod,
    createSubscriptionSession, createEditPaymentSession, findSetupIntent, createWebhook
} = require('../services/stripe')
const { addDiscordRole } = require('../services/discord/utils')
const { getRelease, deleteRelease, useRelease } = require('../services/releases')
const { inStock, getDomain } = require('../utils')

const pay = async (req, res) => {
    try {
        const { currency } = req.query

        if (!req.user) {
            let redirect = '/login?redirect=/stripe/pay'
            if (currency) redirect += '?currency=' + currency
            return res.redirect(redirect)
        }
        if (!(await inStock())) return res.redirect('/')
        if ((await getRelease())?.stock <= 0) { await deleteRelease(); return res.redirect('/') }
        if (await findUserRole(req.user.user_id)) return res.redirect('/dashboard')

        const CUSTOMER = await findCustomer(req.user.stripe_id)
        if (!CUSTOMER) return res.redirect('/logout')
        if (CUSTOMER.subscriptions.data[0]) return res.redirect('/dashboard')

        const SESSION = await createSubscriptionSession(req.user.stripe_id, currency, await getDomain(req))
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
        console.error(e)
        res.redirect('/')
    }
}

const success = async (req, res) => {
    try {
        res.render('response', { status: 'payment-success' })
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

const fail = async (req, res) => {
    try {
        res.render('response', { status: 'payment-fail' })
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

const updatePayment = async (req, res) => {
    try {
        const CUSTOMER = req.user ? await findCustomer(req.user.stripe_id) : undefined
        if (!CUSTOMER) return res.redirect('/logout')
        if (CUSTOMER.subscriptions.data[0]) return res.redirect('/dashboard')

        const SESSION = await createEditPaymentSession(CUSTOMER.id, await getDomain(req))
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
        console.error(e)
        res.redirect('/dashboard')
    }
}

const cancelMembership = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=dashboard')
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE) return res.redirect('/')

        let response
        if (ROLE.name.toLowerCase() === 'renewal') {
            const CUSTOMER = await findCustomer(req.user.stripe_id)
            if (!CUSTOMER) return res.redirect('/logout')
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
            if (!SUBSCRIPTION || SUBSCRIPTION.cancel_at_period_end) return res.redirect('/dashboard')

            response = await updateSubscription(SUBSCRIPTION.id,
                { proration_behavior: 'none', cancel_at_period_end: true })
        } else { response = await deleteUser(req.user.user_id) }

        if (!response) return

        console.log(`User '${req.user.username}' has cancelled its '${ROLE.name.toLowerCase()}' license.`)
        if (ROLE.name.toLowerCase() === 'renewal') res.redirect('/dashboard')
        else res.render('response', { status: 'cancel-role' })
    } catch (e) {
        console.error(e)
        res.redirect('/dashboard')
    }
}

const renewMembership = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=dashboard')
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE) return res.redirect('/')
        if (ROLE.name.toLowerCase() !== 'renewal') return res.redirect('/dashboard')

        const CUSTOMER = await findCustomer(req.user.stripe_id)
        if (!CUSTOMER) return res.redirect('/logout')
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
        if (!SUBSCRIPTION?.['cancel_at_period_end']) return res.redirect('/dashboard')

        const RESPONSE = await updateSubscription(SUBSCRIPTION.id, { cancel_at_period_end: false })

        if (!RESPONSE) return
        console.log(`User '${req.user.username}' has renewed its membership.`)
        res.redirect('/dashboard')
    } catch (e) {
        console.error(e)
        res.redirect('/dashboard')
    }
}

const transferMembership = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=dashboard')
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE) return res.redirect('/')
        if (!['renewal', 'lifetime'].includes(ROLE.name.toLowerCase())) return res.render('response', { status: 'transfer-staff' })

        const { userId } = req.params
        try {
            await Joi.number().required().validateAsync(userId)
        } catch (e) { return res.render('response', { status: 'transfer-fail' }) }

        const USER = await findUser(userId)
        if (!USER || await findUserRole(userId)) return res.render('response', { status: 'transfer-fail' })

        if (ROLE.name.toLowerCase() === 'renewal') {
            const CUSTOMER = await findCustomer(req.user.stripe_id)
            if (!CUSTOMER) return res.redirect('/logout')
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
            if (!SUBSCRIPTION) return res.render('response', { status: 'transfer-fail' })

            if (!(await transferSubscription({
                customerId: USER.stripe_id,
                date: SUBSCRIPTION.current_period_end,
                currency: CUSTOMER.currency
            }))) return res.render('response', { status: 'transfer-fail' })
        }

        if (
            !(await insertUserRole(userId, ROLE.role_id)) ||
            !(await deleteUser(req.user.user_id))
        ) return res.render('response', { status: 'transfer-fail' })

        console.log(`User '${req.user.username}' transferred its '${ROLE.name}' license to '${USER.username}'.`)
        res.render('response', { status: 'transfer-success' })
    } catch (e) {
        console.error(e)
        res.redirect('/dashboard')
    }
}

const webhook = async (req, res) => {
    try {
        const EVENT = await createWebhook(req.body, req.headers['stripe-signature'])
        const SESSION = EVENT?.data?.object
        const USER = SESSION?.customer ? await findUserByStripe(SESSION.customer) : undefined
        if (!USER) return res.json({ received: false })

        if (EVENT.type === 'checkout.session.completed') {
            let defaultPayment
            const CUSTOMER = await findCustomer(USER.stripe_id)
            const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0]
            if (!SUBSCRIPTION) return

            // On bough subscription.
            if (SESSION.mode === 'subscription') {
                defaultPayment = SUBSCRIPTION.default_payment_method
                await useRelease()

                if (!(await findUserRole(USER.user_id))) {
                    const RENEWAL_ROLE = await findRoleByName('renewal')
                    if (RENEWAL_ROLE) {
                        await insertUserRole(USER.user_id, RENEWAL_ROLE.role_id)
                        await addDiscordRole(USER.user_id, RENEWAL_ROLE.role_id)
                    }
                }
                console.log(`User '${USER.username}' has bought a subscription.`)
            } else if (SESSION.mode === 'setup') { // On update subscription payment.
                if (SUBSCRIPTION.cancel_at_period_end) {
                    await updateSubscription(SUBSCRIPTION.id, { cancel_at_period_end: false })
                }

                const SETUP_INTENT = await findSetupIntent(SESSION.setup_intent)
                const PAYMENT_METHOD = SETUP_INTENT
                    ? await attachPaymentMethod(CUSTOMER.id, SETUP_INTENT.payment_method)
                    : undefined
                if (!PAYMENT_METHOD) return
                defaultPayment = PAYMENT_METHOD.id
            }

            await updateCustomer(CUSTOMER.id, { invoice_settings: { default_payment_method: defaultPayment } })
            await updateSubscription(SUBSCRIPTION.id, { default_payment_method: defaultPayment })
        } else if (EVENT.type === 'customer.subscription.deleted') { // On subscription deleted.
            await deleteUser(USER.user_id)
            console.log(`User '${USER.username}' membership has been deleted.`)
        }

        res.json({ received: true })
    } catch (e) {
        console.error(e)
        res.sendStatus(400)
    }
}

module.exports = {
    pay,
    success,
    fail,
    updatePayment,
    cancelMembership,
    renewMembership,
    transferMembership,
    webhook
}
