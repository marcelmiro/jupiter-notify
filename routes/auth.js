'use strict'
const router = require('express').Router()
const passport = require('passport')
const { login, logout, redirect } = require('../controllers/auth')

router.get('/login', login)

router.get('/logout', logout)

router.get('/redirect', passport.authenticate('discord', { failureRedirect: '/' }), redirect)

module.exports = router
