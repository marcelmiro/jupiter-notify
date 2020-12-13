'use strict'
const router = require('express').Router()
const { index, dashboard, join, terms } = require('../controllers')

router.use('/', require('./auth'))
router.use('/stripe', require('./stripe'))
router.use('/admin', require('./admin'))
router.use('/api', require('./api'))

router.get('/', index)

router.get('/dashboard', dashboard)

router.get('/join', join)

router.get('/terms', terms)

module.exports = router
