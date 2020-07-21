'use strict'
const router = require('express').Router()
const { login, loginRedirect, auth } = require('../controllers/api')

router.get('/login', login)

router.get('/login/redirect', loginRedirect)

router.get('/auth', auth)

module.exports = router
