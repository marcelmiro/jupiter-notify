'use strict'
const ssl = {}
if (process.env.URL.includes('localhost')) {
    const fs = require('fs')
    ssl.key = fs.readFileSync('./ssl/localhost-key.pem')
    ssl.cert = fs.readFileSync('./ssl/localhost-cert.pem')
}
module.exports = ssl
