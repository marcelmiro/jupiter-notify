'use strict'
require('dotenv').config()
require('../../config')().then(() => {
    console.log(require('../../config/ssl'))
})
