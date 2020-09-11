'use strict';

var stripe = require('stripe');

module.exports = stripe(process.env.STRIPE_SECRET);