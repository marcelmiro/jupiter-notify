'use strict'
const bodyParser = require('body-parser')
const router = require('express').Router()
const { pay, success, fail, updatePayment, cancelMembership, renewMembership, transferMembership, webhook } = require('../controllers/stripe')

router.get('/pay', pay)

router.get('/success', success)

router.get('/fail', fail)

router.get('/update-payment', updatePayment)

router.get('/cancel-membership', cancelMembership)

router.get('/renew-membership', renewMembership)

router.get('/transfer-membership/:userId', transferMembership)

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), webhook)

module.exports = router
