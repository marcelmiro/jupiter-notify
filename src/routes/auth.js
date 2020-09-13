'use strict'
const passport = require('passport')
const router = require('express').Router()
const { login, logout, loginRedirect } = require('../controllers/auth')

router.get('/login', login)

router.get('/logout', logout)

router.get('/login/redirect',
    passport.authenticate('discord', { failureRedirect: '/' }),
    loginRedirect
)

module.exports = router
