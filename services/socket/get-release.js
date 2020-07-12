'use strict'
const { getRelease } = require('../../services/releases')

module.exports = async socket => {
    try {
        if (!socket.request.role?.['create_releases']) return socket.emit('send-error', 'You don\'t have permission to get release information.')

        const DATA = await getRelease()
        socket.emit('set-release', DATA ? { remaining: DATA.releaseStock, total: DATA.releaseTotalStock } : undefined)
    } catch (e) {
        console.error('Socket \'get-release\': ' + e.message)
        socket.emit('send-error', 'Error in socket \'get-release\'.')
    }
}
