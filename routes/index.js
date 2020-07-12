'use strict'
const router = require('express').Router()
const { index, dashboard, admin, discordJoin, sendSupport } = require('../controllers')

router.use('/auth', require('./auth'))
router.use('/stripe', require('./stripe'))

router.get('/', index)

router.get('/dashboard', dashboard)

router.get('/admin', admin)

router.get('/discord/join', discordJoin)

router.post('/send-support', sendSupport)

module.exports = router
