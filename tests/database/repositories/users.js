'use strict'
require('dotenv').config()
require('../../../config')().then(() => {
    const db = require('../../../database/repositories/users')
    setTimeout(() => process.exit(), 2000)
})
