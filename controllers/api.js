'use strict'
const passport = require('passport')
const { findUserRole } = require('../database/repositories/user-roles')

const login = async (req, res) => {
    try {
        if (req.user) return res.redirect('/api/login/redirect')

        const state = Buffer.from(JSON.stringify({ mode: 'api' })).toString('base64')
        passport.authenticate(
            'discord',
            { scope: ['identify', 'email'], state }
        )(req, res)
    } catch (e) {
        console.error('Route \'/api/login\': ' + e.message)
        res.send(500).send(e.message)
    }
}

const loginRedirect = async (req, res) => {
    try {
        if (!req.user) return res.status(404).send('User not found.')

        const USER_ROLE = await findUserRole(req.user.user_id)
        if (!USER_ROLE) res.status(404).send('User not a member of Jupiter Notify.')
        res.status(200).send({
            userId: req.user.user_id,
            username: req.user.username,
            cookieId: req.user.cookie_id
        })
    } catch (e) {
        console.error('Route \'/api/login/redirect\': ' + e.message)
        res.send(500).send(e.message)
    }
}

const auth = async (req, res) => {
    try {

    } catch (e) {
        console.error('Route \'/api/auth\': ' + e.message)
        res.send(500).send(e.message)
    }
}

module.exports = { login, loginRedirect, auth }
