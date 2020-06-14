'use strict'
require('dotenv').config()
require('../../../config')().then(() => {
    require('../../../services/discord/utils')
    setTimeout(() => process.exit(), 1000)
})
