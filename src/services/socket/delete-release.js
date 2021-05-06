'use strict'
const { getRelease, deleteRelease } = require('../releases')

module.exports = async ({ io, socket }) => {
    try {
        if (!socket.request.role?.create_releases) return socket.emit('send-error', 'You don\'t have permission to delete a release.')

        if (!(await getRelease())?.stock) return socket.emit('send-error', 'Release doesn\'t exist.')

        if (await deleteRelease()) {
            console.log(`User '${socket.request.user.username}' has stopped release.`)
            socket.emit('send-message', 'Release has been stopped.')
            io.sockets.emit('get-release')
        } else socket.emit('send-error', 'Couldn\'t delete release.')
    } catch (e) {
        console.error(e)
    }
}
