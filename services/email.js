'use strict'
const Joi = require('@hapi/joi')
const sgMail = require('../config/email')

const EMAIL_SCHEMA = Joi.object().keys({
    from: Joi.string(),
    to: Joi.string().email().required(),
    subject: Joi.string(),
    html: Joi.string(),
    text: Joi.string()
}).or('html', 'text')

/**
 * @param from: sender name (not email)
 * @param to: email address to send mail to
 * @param subject: email's subject
 * @param html: html text
 * @param text: plain text
 * @returns email's response object or undefined
 */
const sendEmail = async ({ from, to, subject, html, text }) => {
    try {
        await EMAIL_SCHEMA.validateAsync({ from, to, subject, html, text })
        return await sgMail.send({
            to,
            from: { name: from || 'Jupiter Notify', email: process.env.EMAIL_ADDRESS },
            subject: subject || 'Jupiter Notify',
            html,
            text
        })
    } catch (e) {
        return console.error('sendEmail(): ' + e.message)
    }
}

const sendSupport = async ({ name, email, text }) => {
    try {
        return await sendEmail({
            from: 'SUPPORT: ' + name,
            to: process.env.EMAIL_ADDRESS,
            subject: 'SUPPORT: ' + name,
            text: `Name: ${name}\nEmail: ${email}\n\nText:\n${text}`
        })
    } catch (e) {
        return console.error('sendSupport(): ' + e.message)
    }
}

module.exports = { sendEmail, sendSupport }
