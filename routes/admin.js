'use strict'
const router = require('express').Router()
const { index, members, member, restocks, roles, products, logs, settings } = require('../controllers/admin')

router.get('/', index)

router.get('/members', members)
router.get('/members/:userId', member)

router.get('/restocks', restocks)

router.get('/roles', roles)

router.get('/products', products)

router.get('/logs', logs)

router.get('/settings', settings)

router.use((req, res) => res.redirect('/admin'))

module.exports = router
