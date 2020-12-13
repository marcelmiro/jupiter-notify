'use strict'
const Joi = require('joi')
const { findUserRole, findRoleFromUserRole } = require('../database/repositories/user-roles')
const { listRoles } = require('../database/repositories/roles')
const { listPlans } = require('../database/repositories/plans')
const { listResourcePermissions, checkPermission } = require('../services/permissions')

const index = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        res.render('admin/index')
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

const members = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const userRole = await findRoleFromUserRole(req.user.user_id)
        if (!userRole) return res.redirect('/')
        if (!await checkPermission(userRole.role_id, 'members', 'r')) return res.redirect('/admin')

        const [permissions, dbRoles, plans] = await Promise.all([
            listResourcePermissions(userRole.role_id, 'members'),
            listRoles(),
            listPlans()
        ])

        const roles = []
        if (dbRoles) {
            for (const role of dbRoles) {
                role.subscription = plans
                    ? [...new Set(
                        plans.filter(plan => plan.role_id === role.role_id).map(plan => plan.currency)
                    )]
                    : []
                roles.push({
                    name: role.name,
                    importance: role.importance,
                    subscription: role.subscription
                })
            }
        }

        res.render('admin/members', { permissions, roles })
    } catch (e) {
        console.error(e)
        res.redirect('/admin')
    }
}

const member = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const userRole = await findRoleFromUserRole(req.user.user_id)
        if (!userRole) return res.redirect('/')
        if (!await checkPermission(userRole.role_id, 'members', 'r')) return res.redirect('/admin')

        const { userId } = req.params
        try {
            await Joi.number().unsafe().required().validateAsync(userId)
        } catch (e) { return res.redirect('/admin/members') }

        if (!await findUserRole(userId)) return res.redirect('/admin/members')

        const [permissions, dbRoles] = await Promise.all([
            listResourcePermissions(userRole.role_id, 'members'),
            listRoles()
        ])

        const roles = []
        if (dbRoles) for (const role of dbRoles) roles.push({ name: role.name, importance: role.importance })

        res.render('admin/member', { userId, permissions, roles })
    } catch (e) {
        console.error(e)
        res.redirect('/admin')
    }
}

const restocks = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const userRole = await findRoleFromUserRole(req.user.user_id)
        if (!userRole) return res.redirect('/')
        if (!await checkPermission(userRole.role_id, 'restocks', 'r')) return res.redirect('/admin')

        const [permissions, dbRoles] = await Promise.all([
            listResourcePermissions(userRole.role_id, 'restocks'),
            listRoles()
        ])

        const roles = []
        if (dbRoles) for (const role of dbRoles) roles.push({ name: role.name, importance: role.importance })

        res.render('admin/restocks', { permissions, roles })
    } catch (e) {
        console.error(e)
        res.redirect('/admin')
    }
}

const roles = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const userRole = await findRoleFromUserRole(req.user.user_id)
        if (!userRole) return res.redirect('/')
        if (!await checkPermission(userRole.role_id, 'roles', 'r')) return res.redirect('/admin')

        res.render('admin/roles', {
            permissions: await listResourcePermissions(userRole.role_id, 'roles')
        })
    } catch (e) {
        console.error(e)
        res.redirect('/admin')
    }
}

const products = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const userRole = await findRoleFromUserRole(req.user.user_id)
        if (!userRole) return res.redirect('/')
        if (!await checkPermission(userRole.role_id, 'products', 'r')) return res.redirect('/admin')

        const [permissions, roles] = await Promise.all([
            listResourcePermissions(userRole.role_id, 'products'),
            listRoles()
        ])

        res.render('admin/products', { permissions, roles })
    } catch (e) {
        console.error(e)
        res.redirect('/admin')
    }
}

const logs = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const userRole = await findRoleFromUserRole(req.user.user_id)
        if (!userRole) return res.redirect('/')
        if (!await checkPermission(userRole.role_id, 'logs', 'r')) return res.redirect('/admin')

        res.render('admin/logs')
    } catch (e) {
        console.error(e)
        res.redirect('/admin')
    }
}

const settings = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        const userRole = await findRoleFromUserRole(req.user.user_id)
        if (!userRole) return res.redirect('/')
        if (!await checkPermission(userRole.role_id, 'settings', 'r')) return res.redirect('/admin')

        res.render('admin/settings', {
            permissions: await listResourcePermissions(userRole.role_id, 'settings')
        })
    } catch (e) {
        console.error(e)
        res.redirect('/admin')
    }
}

module.exports = { index, members, member, restocks, roles, products, logs, settings }
