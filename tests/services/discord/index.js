'use strict'
require('dotenv').config()
require('../../../services/logger')
require('../../../config')().then(() => {
    require('../../../services/discord')
    // setTimeout(() => process.exit(), 2000)
})
