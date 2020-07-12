'use strict'
require('dotenv').config()
require('../../config')().then(async () => {
    const express = require('express')
    const app = express()
    const port = process.env.PORT || 8080
    const server = require('http').createServer(app)
    await require('../../config/socket').setup(server)
    require('../../services/socket')
    server.listen(port, () => console.log('Server connected to port.'))
})
