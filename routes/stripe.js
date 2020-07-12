'use strict'
const router = require('express').Router()
const bodyParser = require('body-parser')
const { pay, success, fail, updatePayment, cancelMembership, renewMembership, transferMembership, webhook } = require('../controllers/stripe')

router.get('/pay', pay)

router.get('/success', success)

router.get('/fail', fail)

router.get('/update-payment', updatePayment)

router.get('/cancel-membership', cancelMembership)

router.get('/renew-membership', renewMembership)

router.get('/transfer-membership', transferMembership)

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), webhook)

module.exports = router
