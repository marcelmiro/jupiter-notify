'use strict'
const passport = require('passport')
const { findUserRole } = require('../database/repositories/user-roles')

const login = async (req, res) => {
    try {
        let returnTo = req.url.includes('?pay') ? 'subscription-checkout' : undefined
        if (returnTo && req.url.includes('&currency=')) {
            returnTo += '-' + req.url.substr(req.url.indexOf('&currency=') + '&currency='.length)
        }

        const state = returnTo
            ? Buffer.from(JSON.stringify({ returnTo })).toString('base64')
            : undefined

        passport.authenticate(
            'discord',
            { scope: ['identity', 'email'], state }
        )(req, res)
    } catch (e) {
        console.error('Route \'/auth/login\': ' + e.message)
        res.redirect('/')
    }
}

const redirect = async (req, res) => {
    try {
        const USER_ROLE = await findUserRole(req.user.user_id)
        if (USER_ROLE) return res.redirect('/dashboard')

        const { returnTo } = JSON.parse(Buffer.from(req.query.state, 'base64').toString())
        if (!returnTo || !(typeof returnTo === 'string' && returnTo.length > 0)) return res.redirect('/')

        if (returnTo.startsWith('/')) return res.redirect(returnTo)
        if (returnTo.includes('subscription-checkout')) {
            if (returnTo.includes('checkout-')) {
                const CURRENCY = returnTo.substr(returnTo.indexOf('checkout-') + 'checkout-'.length)
                return res.redirect('/stripe/pay?currency=' + CURRENCY)
            } else return res.redirect('/stripe/pay')
        }
        res.redirect('/')
    } catch (e) {
        console.error('Route \'/auth/redirect\': ' + e.message)
        res.redirect('/')
    }
}

const logout = async (req, res) => {
    try {
        req.logout()
        res.redirect('/')
    } catch (e) {
        console.error('Route \'/auth/logout\': ' + e.message)
        res.redirect('/')
    }
}

module.exports = { login, redirect, logout }
