'use strict'
const router = require('express').Router()
const passport = require('passport')
const { login, logout, loginRedirect } = require('../controllers/auth')

router.get('/login', login)

router.get('/login/redirect', passport.authenticate('discord', { failureRedirect: '/' }), loginRedirect)

router.get('/logout', logout)

module.exports = router
