'use strict'
const Joi = require('@hapi/joi')
const browser = require('browser-detect')
const { findUserRole, findRoleFromUserRole } = require('../database/repositories/user-roles')
const { customers: { findCustomer } } = require('../services/stripe')

const getBrowser = (req, res, next) => {
    browser(req.headers['user-agent']).name === 'ie'
        ? res.render('ie') : next()
}

const ROUTES = {
    member: ['dashboard'],
    admin: ['admin', 'vue.js', 'socket.io.js']
}
const verifyRoute = async (req, res, next) => {
    try {
        if (!Object.values(ROUTES).flat().find(route => req.path.includes(route))) return next()
        if (!req.user) return res.redirect('/')

        if (ROUTES.member.find(route => req.path.includes(route))) {
            const USER_ROLE = await findUserRole(req.user.user_id)
            if (!USER_ROLE) {
                const CUSTOMER = await findCustomer(req.user.stripe_id)
                if (!CUSTOMER) return res.redirect('/logout')
                if (!CUSTOMER.subscriptions.data[0]) return res.redirect('/')
            }
            return next()
        } else if (ROUTES.admin.find(route => req.path.includes(route))) {
            const ROLE = await findRoleFromUserRole(req.user.user_id)
            if (ROLE?.['admin_panel']) return next()
        }
        return res.redirect('/')
    } catch (e) {
        console.error('verifyRoute(): ' + e.message)
        return res.redirect('/')
    }
}

const transformDate = async date => {
    try {
        await Joi.date().required().validateAsync(date)

        let day = date.getDate()
        day = day.toString().length === 1 ? '0' + day : day
        let month = date.getMonth() + 1
        month = month.toString().length === 1 ? '0' + month : month
        const year = date.getFullYear()

        return day + '/' + month + '/' + year
    } catch (e) {
        return console.error('transformDate(): ' + e.message)
    }
}

const inStock = async () => {
    try {
        return Boolean(process.env.IN_STOCK.toLowerCase() === 'true')
    } catch (e) {
        return console.error('inStock(): ' + e.message)
    }
}

module.exports = { getBrowser, verifyRoute, transformDate, inStock }
