'use strict'

module.exports = async server => {
    return require('socket.io')(server)
}
