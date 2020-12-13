'use strict'
let io

const setup = server => {
    io = require('socket.io')(server)
    require('../services/socket').setup(io)
}

module.exports = {
    setup,
    getIo: () => io
}
