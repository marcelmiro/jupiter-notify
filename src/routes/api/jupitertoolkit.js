'use strict'
const router = require('express').Router()
const { authorize } = require('../../controllers/api/jupitertoolkit')

router.post('/authorize', authorize)

module.exports = router
