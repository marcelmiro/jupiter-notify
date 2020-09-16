'use strict'
const passport = require('passport')
const { findUserRole } = require('../database/repositories/user-roles')

const login = async (req, res) => {
    try {
        const { redirect } = req.query
        const returnTo = redirect && (typeof redirect === 'string' || redirect instanceof String)
            ? redirect
            : undefined

        if (req.user) {
            return res.redirect(
                returnTo
                    ? (returnTo.startsWith('http') || returnTo.startsWith('/') ? '' : '/') + returnTo
                    : '/'
            )
        }

        const state = returnTo
            ? Buffer.from(JSON.stringify({ returnTo })).toString('base64')
            : undefined

        passport.authenticate(
            'discord',
            { scope: ['identify', 'email'], state }
        )(req, res)
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

const logout = async (req, res) => {
    try {
        req.logout()
        res.redirect('/')
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

const passportRedirect = async (req, res, next) => {
    passport.authenticate('discord', (err, user, info) => {
        if (err) return next(err)
        if (user) {
            req.logIn(user, err => {
                if (err) return next(err)
            })
        }

        if (info?.missing === 'email') return res.redirect('/?login_fail')
        next()
    })(req, res, next)
}

const loginRedirect = async (req, res) => {
    try {
        const { returnTo } = req.query.state
            ? JSON.parse(Buffer.from(req.query.state, 'base64').toString())
            : {}

        if (!req.user) res.redirect('/')
        else if (returnTo) res.redirect((returnTo.startsWith('http') || returnTo.startsWith('/') ? '' : '/') + returnTo)
        else if (await findUserRole(req.user.user_id)) res.redirect('/dashboard')
        else res.redirect('/')
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

module.exports = { login, logout, passportRedirect, loginRedirect }
