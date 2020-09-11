'use strict'
const router = require('express').Router()
const { index, dashboard, admin, join, terms } = require('../controllers')

router.use('/', require('./auth'))
router.use('/stripe', require('./stripe'))
router.use('/api', require('./api'))

router.get('/', index)

router.get('/dashboard', dashboard)

router.get('/admin', admin)

router.get('/join', join)

router.get('/terms', terms)

module.exports = router
