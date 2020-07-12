'use strict'
require('dotenv').config()
require('../../../config')().then(() => {
    const db = require('../../../database/repositories/settings')
    setTimeout(() => process.exit(), 2000)
})
