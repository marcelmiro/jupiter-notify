'use strict'
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.EMAIL_API)
module.exports = sgMail
