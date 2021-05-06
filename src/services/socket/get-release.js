'use strict'
const { getRelease } = require('../releases')

module.exports = async socket => {
    try {
        if (!socket.request.role?.create_releases) return socket.emit('send-error', 'You don\'t have permission to retrieve release information.')

        socket.emit('set-release', await getRelease())
    } catch (e) {
        console.error(e)
    }
}
