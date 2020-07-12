'use strict'
const passport = require('passport')
const { findUserRole } = require('../database/repositories/user-roles')

const login = async (req, res) => {
    try {
        if (req.user) return res.redirect('/')
        let returnTo = req.url.includes('?pay') ? 'subscription-checkout' : undefined
        if (returnTo && req.url.includes('&currency=')) {
            returnTo += '-' + req.url.substr(req.url.indexOf('&currency=') + '&currency='.length)
        }

        const state = returnTo
            ? Buffer.from(JSON.stringify({ returnTo })).toString('base64')
            : undefined

        passport.authenticate(
            'discord',
            { scope: ['identify', 'email'], state }
        )(req, res)
    } catch (e) {
        console.error('Route \'/auth/login\': ' + e.message)
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

const redirect = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/')
        if (await findUserRole(req.user.user_id)) return res.redirect('/dashboard')

        const { returnTo } = req.query.state
            ? JSON.parse(Buffer.from(req.query.state, 'base64').toString())
            : {}
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

module.exports = { login, logout, redirect }
