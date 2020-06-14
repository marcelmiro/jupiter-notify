'use strict'
let io
const setup = async server => {
    io = require('socket.io')(server)

    // TODO Move this to 'get-log' file
    const TRUE_CONSOLE_LOG = console.log
    console.log = msg => {
        TRUE_CONSOLE_LOG(msg)
        io.sockets.emit('get-logs')
    }
    const TRUE_CONSOLE_ERROR = console.error
    console.error = msg => {
        TRUE_CONSOLE_ERROR(msg)
        io.sockets.emit('get-logs')
    }
}

module.exports = { setup, getIo: () => { return io } }
