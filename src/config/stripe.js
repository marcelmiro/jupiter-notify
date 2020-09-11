'use strict'
const stripe = require('stripe')

module.exports = stripe(process.env.STRIPE_SECRET)
