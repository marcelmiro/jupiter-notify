'use strict'
require('dotenv').config()
require('../../config')().then(() => {
    // require('../../services/email')
    setTimeout(() => process.exit(), 2000)
})
