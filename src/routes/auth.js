'use strict'
const router = require('express').Router()
const { login, logout, passportRedirect, loginRedirect } = require('../controllers/auth')

router.get('/login', login)

router.get('/logout', logout)

router.get('/login/redirect', passportRedirect, loginRedirect)

module.exports = router
