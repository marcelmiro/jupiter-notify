'use strict'
const Joi = require('joi')
const browser = require('browser-detect')
const { findUserRole, findRoleFromUserRole } = require('../database/repositories/user-roles')

const CURRENCIES = {
    usd: '$',
    eur: '€',
    gbp: '£'
}

const checkIEBrowser = (req, res, next) => {
    browser(req.headers['user-agent']).name === 'ie'
        ? res.render('ie')
        : next()
}

const ROUTES = {
    member: [],
    admin: ['vue.js', 'socket.io.js']
}
const verifyRoute = async (req, res, next) => {
    try {
        if (!Object.values(ROUTES).flat().find(route => req.path.includes(route))) return next()
        if (!req.user) return res.redirect('/')

        if (ROUTES.member.find(route => req.path.includes(route))) {
            if (await findUserRole(req.user.user_id)) return next()
        } else if (ROUTES.admin.find(route => req.path.includes(route))) {
            const ROLE = await findRoleFromUserRole(req.user.user_id)
            if (ROLE?.admin_panel) return next()
        }

        res.redirect('/')
    } catch (e) {
        console.error(e)
    }
}

const inStock = async () => {
    return Boolean(process.env.IN_STOCK?.toLowerCase() === 'true')
}

const getDomain = async req => {
    try {
        await Joi.object().required().validateAsync(req)
    } catch (e) { return }

    const PROTOCOL = req.protocol
    const DOMAIN = req.get('host')

    if (!PROTOCOL || !DOMAIN) return
    return PROTOCOL + '://' + DOMAIN
}

const getCurrencySymbol = async currency => {
    try {
        await Joi.string().alphanum().required().validateAsync(currency)
    } catch (e) { return }

    return CURRENCIES[currency.toLowerCase()]
}

module.exports = { checkIEBrowser, verifyRoute, inStock, getDomain, getCurrencySymbol }
