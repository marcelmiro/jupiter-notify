'use strict'
const { getIo } = require('../../config/socket')
const auth = require('./auth')

const setup = io => {
    auth(io)

    io.on('connection', async socket => {
        socket.on('get-members', () => require('./get-members')(socket))
        socket.on('get-db-member', value => require('./get-db-member')(socket, value))
        socket.on('add-member', member => require('./add-member')(socket, member))

        socket.on('get-member', userId => require('./get-member')(socket, userId))
        socket.on('update-member', member => require('./update-member')(socket, member))
        socket.on('cancel-subscription', userId => require('./cancel-subscription')(socket, userId))
        socket.on('delete-member', userId => require('./delete-member')(socket, userId))

        socket.on('get-restocks', () => require('./get-restocks')(socket))
        socket.on('add-restock', restock => require('./add-restock')(socket, restock))
        socket.on('update-restock', restock => require('./update-restock')(socket, restock))
        socket.on('delete-restock', password => require('./delete-restock')(socket, password))

        socket.on('get-in-stock', () => require('./get-in-stock')(socket))
        socket.on('update-in-stock', value => require('./update-in-stock')(socket, value))

        socket.on('get-roles', () => require('./get-roles')(socket))
        socket.on('add-role', role => require('./add-role')(socket, role))
        socket.on('update-role', role => require('./update-role')(socket, role))
        socket.on('delete-role', roleId => require('./delete-role')(socket, roleId))

        socket.on('get-products', () => require('./get-products')(socket))
        socket.on('add-product', product => require('./add-product')(socket, product))
        socket.on('delete-product', productId => require('./delete-product')(socket, productId))

        socket.on('get-logs', () => require('./get-logs')(socket))

        socket.on('get-settings', () => require('./get-settings')(socket))
        socket.on('update-settings', settings => require('./update-settings')(socket, settings))
    })

    const CONSOLE_LOG = console.log
    console.log = msg => { CONSOLE_LOG(msg); io.sockets.emit('get-logs') }
    const CONSOLE_INFO = console.info
    console.info = msg => { CONSOLE_INFO(msg); io.sockets.emit('get-logs') }
    const CONSOLE_WARN = console.warn
    console.warn = msg => { CONSOLE_WARN(msg); io.sockets.emit('get-logs') }
    const CONSOLE_ERROR = console.error
    console.error = msg => { CONSOLE_ERROR(msg); io.sockets.emit('get-logs') }
    const CONSOLE_FATAL = console.fatal
    console.fatal = msg => { CONSOLE_FATAL(msg); io.sockets.emit('get-logs') }
}

const emitSocket = async socket => {
    if (typeof socket !== 'string') return
    const io = await getIo()
    if (!io) return
    return io.sockets.emit(socket)
}

module.exports = { setup, emitSocket }
