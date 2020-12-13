'use strict'
const { name, keys } = require('../../config/cookies')
const session = require('cookie-session')({
    name: name,
    keys: keys
})
const { findUserByCookie } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')

module.exports = io => {
    // Authenticate user before connecting to socket.
    io.use(async (socket, next) => {
        // Check if socket is in '/admin' route.
<<<<<<< Updated upstream:services/socket/auth.js
        if (socket.handshake.headers.referer !== process.env.URL + '/admin') return
=======
        if (
            socket.handshake.headers.referer &&
            !socket.handshake.headers.referer.includes('/admin')
        ) return
>>>>>>> Stashed changes:src/services/socket/auth.js

        // Get user's cookie id.
        const req = { headers: { cookie: socket.handshake.headers.cookie } }
        session(req, {}, function () {})

        // Get user's role from cookie id and authenticate user.
        const USER = req.session.passport?.user
            ? await findUserByCookie(req.session.passport.user)
            : undefined
        const ROLE = USER ? await findRoleFromUserRole(USER.user_id) : undefined
        if (!ROLE) return

        // Allow connection if user's role exists
        // and save user and role objects to socket.
<<<<<<< Updated upstream:services/socket/auth.js
        if (ROLE?.['admin_panel']) {
            socket.request.user = USER
            socket.request.role = ROLE
            return socket
        }
=======
        socket.request.user = USER
        socket.request.role = ROLE
        next()
>>>>>>> Stashed changes:src/services/socket/auth.js
    })
}
