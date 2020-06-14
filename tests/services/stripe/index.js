'use strict'
require('dotenv').config()
require('../../../config')().then(() => {
    setTimeout(() => process.exit(), 1000)
})
