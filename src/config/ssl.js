'use strict'

const ssl = {}
if (process.env.NODE_ENV !== 'production') {
    const fs = require('fs')
    ssl.key = fs.readFileSync('./ssl/localhost-key.pem')
    ssl.cert = fs.readFileSync('./ssl/localhost.pem')
}

module.exports = ssl
