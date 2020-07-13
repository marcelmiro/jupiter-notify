'use strict'

module.exports = io => {
    require('./auth')(io)

    io.on('connection', socket => {
        socket.on('get-member-list', () => require('./get-member-list')(socket))
        socket.on('get-member-view', userId => require('./get-member-view')({ socket, userId }))
        socket.on('get-member-edit', userId => require('./get-member-edit')({ socket, userId }))

        socket.on('add-member', ({ userId, role }) => require('./add-member')({ io, socket, userId, role }))
        socket.on('delete-member', ({ userId }) => require('./delete-member')({ io, socket, userId }))
        socket.on('update-member', ({ userId, name, value }) => require('./update-member')({ io, socket, userId, name, value }))

        socket.on('get-release', () => require('./get-release')(socket))
        socket.on('create-release', number => require('./create-release')({ io, socket, number }))
        socket.on('delete-release', () => require('./delete-release')({ io, socket }))

        socket.on('get-logs', () => require('./get-logs')(socket))
        socket.on('get-settings', () => require('./get-settings')(socket))
        socket.on('update-setting', ({ name, value }) => require('./update-setting')({ io, socket, name, value }))
    })

    const CONSOLE_LOG = console.log
    console.log = msg => {
        CONSOLE_LOG(msg)
        io.sockets.emit('get-logs')
    }
    const CONSOLE_ERROR = console.error
    console.error = msg => {
        CONSOLE_ERROR(msg)
        io.sockets.emit('get-logs')
    }
}
