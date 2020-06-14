'use strict'
require('dotenv').config()
require('../../services/logger')
require('../../config')().then(() => {
    setTimeout(() => process.exit(), 2000)
})
