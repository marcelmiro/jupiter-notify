'use strict'
const router = require('express').Router()
const { ticket } = require('../../controllers/api/discord')

router.post('/ticket', ticket)

module.exports = router
