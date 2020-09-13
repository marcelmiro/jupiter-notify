'use strict'
const Joi = require('joi')
const browser = require('browser-detect')
const { findUserRole, findRoleFromUserRole } = require('../database/repositories/user-roles')

const checkIEBrowser = (req, res, next) => {
    browser(req.headers['user-agent']).name === 'ie'
        ? res.render('ie') : next()
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
            if (ROLE?.['admin_panel']) return next()
        }

        res.redirect('/')
    } catch (e) {
        console.error(e)
    }
}

const transformDate = async date => {
    try {
        await Joi.date().required().validateAsync(date)
    } catch (e) { return }

    let day = date.getDate()
    day = day.toString().length === 1 ? '0' + day : day
    let month = date.getMonth() + 1
    month = month.toString().length === 1 ? '0' + month : month
    const year = date.getFullYear()

    return day + '/' + month + '/' + year
}

const inStock = async () => {
    return Boolean(process.env.IN_STOCK.toLowerCase() === 'true')
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

module.exports = { checkIEBrowser, verifyRoute, transformDate, inStock, getDomain }
