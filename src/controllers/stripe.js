'use strict'
const Joi = require('joi')
const { findUser, findUserByStripe } = require('../database/repositories/users')
const { findUserRole, findRoleFromUserRole, insertUserRole } = require('../database/repositories/user-roles')
const { findRole, findRoleByName } = require('../database/repositories/roles')
const { listRoleIdsFromPlans, listCurrenciesFromPlans, findPlan, findPlanByRoleAndCurrency } = require('../database/repositories/plans')
const { deleteUser } = require('../services/users')
const {
    findCustomer, updateCustomer, createSubscription, updateSubscription, attachPaymentMethod,
    createSubscriptionSession, createEditPaymentSession, findSetupIntent, createWebhook
} = require('../services/stripe')
const { addDiscordRole } = require('../services/discord/utils')
const { getRelease, deleteRelease, useRelease } = require('../services/releases')
const { inStock, getDomain } = require('../utils')

const pay = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        if (!(await inStock())) return res.redirect('/')
        if ((await getRelease())?.stock <= 0) { await deleteRelease(); return res.redirect('/') }
        if (await findUserRole(req.user.user_id)) return res.redirect('/dashboard')

        const CUSTOMER = await findCustomer(req.user.stripe_id)
        if (!CUSTOMER) return res.redirect('/logout')
        if (CUSTOMER.subscriptions.data[0]) return res.redirect('/dashboard')

        let { plan, currency } = req.query
        try {
            await Joi.object().keys({
                plan: [Joi.number(), Joi.string()],
                currency: Joi.string()
            }).required().validateAsync({ plan, currency })
        } catch (e) { return res.redirect('/stripe/fail') }

        if (!plan) {
            const PLAN_ROLES = await listRoleIdsFromPlans()
            if (PLAN_ROLES?.length === 1) plan = PLAN_ROLES[0]
        }
        if (!currency) {
            const PLAN_CURRENCIES = await listCurrenciesFromPlans()
            if (PLAN_CURRENCIES?.length === 1) currency = PLAN_CURRENCIES[0]
        }
        if (!plan || !currency) return res.redirect('/stripe/fail')

        const ROLE = !isNaN(parseFloat(plan)) && !isNaN(plan - 0)
            ? await findRole(plan)
            : await findRoleByName(plan)
        const PLAN = ROLE?.role_id ? await findPlanByRoleAndCurrency(ROLE.role_id, currency) : undefined
        if (!PLAN) return res.redirect('/stripe/fail')

        const SESSION = await createSubscriptionSession({
            customerId: req.user.stripe_id,
            planId: PLAN.plan_id,
            url: await getDomain(req)
        })

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
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const CUSTOMER = req.user ? await findCustomer(req.user.stripe_id) : undefined
        if (!CUSTOMER) return res.redirect('/logout')
        if (!CUSTOMER.subscriptions.data[0]) return res.redirect('/dashboard')

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
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE?.role_id) return res.redirect('/')

        let response
        const PLAN_ROLES = await listRoleIdsFromPlans()
        if (PLAN_ROLES?.includes(ROLE.role_id)) {
            const CUSTOMER = await findCustomer(req.user.stripe_id)
            if (!CUSTOMER) return res.redirect('/logout')
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
            if (!SUBSCRIPTION || SUBSCRIPTION.cancel_at_period_end) return res.redirect('/dashboard')

            response = await updateSubscription(
                SUBSCRIPTION.id, { proration_behavior: 'none', cancel_at_period_end: true }
            )
        } else { response = await deleteUser(req.user.user_id) }

        if (!response) return

        console.log(`User '${req.user.username}' has cancelled its '${ROLE.name.toLowerCase()}' license.`)
        if (PLAN_ROLES?.includes(ROLE.role_id)) res.redirect('/dashboard')
        else res.render('response', { status: 'cancel-role' })
    } catch (e) {
        console.error(e)
        res.redirect('/dashboard')
    }
}

const renewMembership = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE?.role_id) return res.redirect('/')

        const PLAN_ROLES = await listRoleIdsFromPlans()
        if (!PLAN_ROLES?.includes(ROLE.role_id)) return res.render('response', { status: 'renew-not-possible' })

        const CUSTOMER = await findCustomer(req.user.stripe_id)
        if (!CUSTOMER) return res.redirect('/logout')
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
        if (!SUBSCRIPTION?.cancel_at_period_end) return res.redirect('/dashboard')

        if (!(await updateSubscription(SUBSCRIPTION.id, { cancel_at_period_end: false }))) return
        console.log(`User '${req.user.username}' has renewed its membership.`)
        res.redirect('/dashboard')
    } catch (e) {
        console.error(e)
        res.redirect('/dashboard')
    }
}

const transferMembership = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const ROLE = await findRoleFromUserRole(req.user.user_id)
        if (!ROLE?.role_id) return res.redirect('/')
        if (!ROLE.transferable) return res.render('response', { status: 'transfer-not-possible' })

        const { userId } = req.params
        try {
            await Joi.number().unsafe().required().validateAsync(userId)
        } catch (e) { return res.render('response', { status: 'transfer-input-fail' }) }

        if (req.user.user_id === userId) return res.render('response', { status: 'transfer-fail' })
        const USER = await findUser(userId)
        if (!USER) return res.render('response', { status: 'transfer-user-fail' })
        if (await findUserRole(userId)) return res.render('response', { status: 'transfer-role-fail' })

        const PLAN_ROLES = await listRoleIdsFromPlans()
        if (PLAN_ROLES?.includes(ROLE.role_id)) {
            const CUSTOMER = await findCustomer(req.user.stripe_id)
            if (!CUSTOMER) return res.redirect('/logout')
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
            const planId = SUBSCRIPTION?.items.data[0]?.price.id

            if (
                !planId ||
                !(await createSubscription({
                    planId,
                    customerId: USER.stripe_id,
                    date: SUBSCRIPTION.current_period_end
                }))
            ) return res.render('response', { status: 'transfer-fail' })
        }

        if (
            !(await insertUserRole(userId, ROLE.role_id)) ||
            !(await deleteUser(req.user.user_id))
        ) return res.render('response', { status: 'transfer-fail' })

        await addDiscordRole(userId, ROLE.role_id)
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
                    const PLAN_ID = SUBSCRIPTION?.items.data[0]?.price.id
                    const PLAN = PLAN_ID ? await findPlan(PLAN_ID) : undefined

                    if (PLAN?.role_id) {
                        await insertUserRole(USER.user_id, PLAN.role_id)
                        await addDiscordRole(USER.user_id, PLAN.role_id)
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
                if (!PAYMENT_METHOD?.id) return
                defaultPayment = PAYMENT_METHOD.id
                await updateSubscription(SUBSCRIPTION.id, { default_payment_method: defaultPayment })
            }

            if (defaultPayment) {
                await updateCustomer(
                    CUSTOMER.id,
                    { invoice_settings: { default_payment_method: defaultPayment } })
            }
        } else if (EVENT.type === 'customer.subscription.deleted') { // On subscription deleted.
            await deleteUser(USER.user_id)
            console.log(`User '${USER.username}' membership has been deleted.`)
        }

        res.json({ received: true })
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
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
